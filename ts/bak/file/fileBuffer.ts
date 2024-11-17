import type { DataTag } from "../dataTags";

export const COMPRESSION_LZW  = 0;
export const COMPRESSION_LZSS = 1;
export const COMPRESSION_RLE  = 2;

export class FileBuffer {
  public uint8Array: Uint8Array;
  private index: number = 0;
  private nextBit: number = 0;

  constructor(uint8Array: Uint8Array) {
    this.uint8Array = uint8Array;
  }

  static createEmpty(size: number): FileBuffer {
    return new FileBuffer(new Uint8Array(size));
  }

  static async createFromFile(path: string): Promise<FileBuffer> {
    const file = Bun.file(path);
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return new FileBuffer(uint8Array);
  }

  // populate this.uint8Array with contents of buf.uint8Array.
  // TODO: THis probably needs a better explanation and better function name.
  // because its very unclear what it does.
  fill(buf: FileBuffer): void {
    this.index = 0;
    buf.getData(
      this.uint8Array,
      Math.min(this.uint8Array.length, buf.uint8Array.length),
    );
  }

  loadUint8Vector(length: number): number[] {
    const vector: number[] = [];
    for (let i = 0; i < length; i++) {
      vector.push(this.getUint8());
    }
    return vector;
  }

  skip(n: number): void {
    // TODO: I dont know why it check (this.index) i.e. that index is not zero.
    // So I just run some code to explode if that ever happens
    // TODO: Remove this check prolly, just really for debug.
    if (!this.index) {
      throw new Error("FileBuffer.skip: index is zero. Maybe it should be allowed. I dont know.");
    }
    // TODO: Remove this check prolly, just really for debug.
    // So these two exception are not in the original code.
    // The original code just skipped skipping if the condition was not met.
    // but I want to examine its behaviour.
    if(!(this.index + n <= this.uint8Array.length)) {
      throw new Error(`FileBuffer.skip: index + n is greater than the uint8Array length: ${this.index} + ${n} > ${this.uint8Array.length}`);
    }
    if ((this.index) && (this.index + n <= this.uint8Array.length)) {
        this.index += n;
    }
  }

  getUint8(): number {
    const value: number = this.uint8Array[this.index];
    this.index += 1;
    // >>> 0 to ensure the value is treated as an unsigned 32-bit integer
    return value >>> 0;
  }

  getUint32LE(): number {
    const value: number = this.uint8Array[this.index] |
                (this.uint8Array[this.index + 1] << 8) |
                (this.uint8Array[this.index + 2] << 16) |
                (this.uint8Array[this.index + 3] << 24);
    this.index += 4;
    // >>> 0 to ensure the value is treated as an unsigned 32-bit integer
    return value >>> 0;
  }

  getUint16LE(): number {
    const value: number = this.uint8Array[this.index] | (this.uint8Array[this.index + 1] << 8);
    this.index += 2;
    // >>> 0 to ensure the value is treated as an unsigned 32-bit integer
    return value >>> 0;
  }

  getString(length: number): string {
    const bytes: Uint8Array = this.uint8Array.slice(this.index, this.index + length);
    const string: string = new TextDecoder().decode(bytes);
    this.index += length;
    return string;
  }

  // TODO: rename to setOffset?
  seek(offset: number): void {
    this.index = offset;
  }

  makeSubBuffer(offset: number, size: number): FileBuffer {
    if (this.uint8Array.length < offset + size) {
      throw new Error(`Requested new FileBuffer larger than available size: (${offset}, ${size}) my size: ${this.uint8Array.length}`);
    }
    return new FileBuffer(this.uint8Array.subarray(offset, offset + size));
  }

  // decompresses this buffer and put it on the result buffer on argument.
  decompressLZW(result: FileBuffer) {
    console.log(`decompressLZW: fb.uint8Array.length: ${result.uint8Array.length}`);
    try {
      const codetable: { prefix: number; append: number }[] = new Array(4096);
      const decodestack: number[] = new Array(4096);
      let stackptr = 0;
      let n_bits = 9;
      let free_entry = 257;
      let oldcode = this.getBits(n_bits);
      let lastbyte = oldcode;
      let bitpos = 0;
      result.putUint8(oldcode);

      while (!this.atEnd() && !result.atEnd()) {
        const newcode = this.getBits(n_bits);
        bitpos += n_bits;
        if (newcode === 256) {
          this.skipBits();
          this.skip((((bitpos - 1) + ((n_bits << 3) - (bitpos - 1 + (n_bits << 3)) % (n_bits << 3))) - bitpos) >> 3);
          n_bits = 9;
          free_entry = 256;
          bitpos = 0;
        } else {
          let code = newcode;
          if (code >= free_entry) {
            decodestack[stackptr++] = lastbyte;
            code = oldcode;
          }
          while (code >= 256) {
            decodestack[stackptr++] = codetable[code].append;
            code = codetable[code].prefix;
          }
          decodestack[stackptr++] = code;
          lastbyte = code;
          while (stackptr > 0) {
            result.putUint8(decodestack[--stackptr]);
          }
          if (free_entry < 4096) {
            codetable[free_entry] = { prefix: oldcode, append: lastbyte };
            free_entry++;
            if (free_entry >= (1 << n_bits) && n_bits < 12) {
              n_bits++;
              bitpos = 0;
            }
          }
          oldcode = newcode;
        }
      }
      result.rewind();

      console.log(`decompressLZW: result.uint8Array: ${result.uint8Array}`);
    } catch (e: any) {
      console.error(`Error in decompressLZW: ${e?.message}`);
      throw e;
    }
  }

  // returns how many bytes were read from this buffer.
  decompressRLE(fb: FileBuffer): number {
    try {
      while (!this.atEnd() && !fb.atEnd()) {
        const control = this.getUint8();
        if (control & 0x80) {
          fb.putData(this.getUint8(), control & 0x7f);
        } else {
          fb.copyFrom(this, control);
        }
      }
      const indexAfterwards = this.index;
      fb.rewind();
      return indexAfterwards;
    } catch (e: any) {
      console.error(`Error in decompressRLE: ${e?.message}`);
      throw e;
    }
  }

  // decompresses this buffer and put it on the result buffer on argument.
  // TODO: The original code a number here, do I need that?
  decompress(result: FileBuffer, method: number) {
    switch (method) {
      case COMPRESSION_LZW: {
        const firstValue = this.getUint8();
        if (firstValue !== 0x02) {
          throw new Error("DataCorruption!");
        }
        const secondValue = this.getUint32LE();
        if (secondValue !== result.uint8Array.length) {
          throw new Error(`DataCorruption! Expected ${result.uint8Array.length} but got ${secondValue}`);
        }
        this.decompressLZW(result);
        // Maybe the check for size should be afterwards?
        return;
      }
      // TODO: Implement the other compression methods.
      case COMPRESSION_RLE: {
        this.decompressRLE(result);
        return;
      }
      default: {
        throw new Error(`Unknown compression method: ${method}`);
      }
    }
  }

  getBits(n: number): number {
    let x = 0;
    for (let i = 0; i < n; i++) {
      x += (this.uint8Array[this.index] & (1 << this.nextBit)) ? (1 << i) : 0;
      this.nextBit++;
      if (this.nextBit > 7) {
        this.index++;
        this.nextBit = 0;
      }
    }
    return x;
  }

  skipBits(): void {
    if (this.nextBit) {
      this.skip(1);
      this.nextBit = 0;
    }
  }

  atEnd(): boolean {
    return this.index >= this.uint8Array.length;
  }

  // TODO: Havent doublecheced if this is correctly implemented.
  putData(data: number, n: number): void {
    if (this.index + n <= this.uint8Array.length) {
      this.uint8Array.fill(data, this.index, this.index + n);
      this.index += n;
    } else {
      throw new Error("BufferFull!");
    }
  }

  // TODO: Havent doublecheced if this is correctly implemented.
  copyFrom(src: FileBuffer, n: number): void {
    if (this.index + n <= this.uint8Array.length) {
      this.uint8Array.set(src.uint8Array.subarray(src.index, src.index + n), this.index);
      this.index += n;
      src.index += n;
    } else {
      throw new Error("BufferFull!");
    }
  }

  rewind(): void {
    this.index = 0;
  }

  find(tag: DataTag): FileBuffer {
    let search = this.uint8Array;
    for (let i = 0; i < this.uint8Array.length - 4; i++) {
      const current = this.uint8Array[i] |
        (this.uint8Array[i + 1] << 8) |
        (this.uint8Array[i + 2] << 16) |
        (this.uint8Array[i + 3] << 24);
      if (current === tag) {
        const offset = i + 4;
        const size = this.uint8Array[offset] |
          (this.uint8Array[offset + 1] << 8) |
          (this.uint8Array[offset + 2] << 16) |
          (this.uint8Array[offset + 3] << 24);
        return this.makeSubBuffer(offset + 4, size);
      }
    }

    throw new Error(`Tag not found: ${tag}`);
  }

  putUint8(x: number): void {
    if (this.index < this.uint8Array.length) {
      this.uint8Array[this.index] = x;
      this.index += 1;
    } else {
      throw new Error("BufferFull!");
    }
  }

  // TODO: Write a comment explaining what this function does and maybe rename.
  // because its a bit unclear.
  getData(data: Uint8Array, n: number): void {
    if (this.index + n <= this.uint8Array.length) {
      data.set(this.uint8Array.subarray(this.index, this.index + n));
      this.index += n;
    } else {
      throw new Error("BufferEmpty!");
    }
  }
}


