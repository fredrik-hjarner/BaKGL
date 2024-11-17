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

  // populate buf with contents of this buffer.
  // TODO: This could probably be done better and with better
  // function name to make it clearer, like .clone or something.
  fill(buf: FileBuffer): void {
    // buf.uint8Array.length; // in this function I want to keep the size of buf the same!!!!
    this.index = 0;
    buf.uint8Array.set(this.uint8Array);
    // buf.uint8Array = this.uint8Array.slice();
    // TODO: Original code seem to also move index forward.
    // That because data is read from this buffer so index
    // is moved forward, so it will pretty much be at the end
    // but I dont think thats needed here?
    this.index = this.uint8Array.length;
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

  // decompresses this buffer and put it on the fb buffer on argument.
  decompressLZW(fb: FileBuffer) {
    try {
      const codetable: { prefix: number; append: number }[] = new Array(4096);
      const decodestack: number[] = new Array(4096);
      let stackptr = 0;
      let n_bits = 9;
      let free_entry = 257;
      let oldcode = this.getBits(n_bits);
      let lastbyte = oldcode;
      let bitpos = 0;
      const result = new Uint8Array(this.uint8Array.length);
      let resultIndex = 0;
      result[resultIndex++] = oldcode;

      while (this.index < this.uint8Array.length) {
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
            result[resultIndex++] = decodestack[--stackptr];
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

      // return new FileBuffer(result.slice(0, resultIndex));
      // put the stuff on the fb buffer.
      // TODO: Maybe instead of operating on "result" should just operate on fb directly.
      fb.uint8Array = result.slice(0, resultIndex);
    } catch (e: any) {
      console.error(`Error in decompressLZW: ${e?.message}`);
      throw e;
    }
  }

  // decompresses this buffer and put it on the fb buffer on argument.
  decompress(fb: FileBuffer, method: number) {
    switch (method) {
      case COMPRESSION_LZW: {
        const firstValue = this.getUint8();
        if (firstValue !== 0x02) {
          throw new Error("DataCorruption!");
        }
        const secondValue = this.getUint32LE();
        if (secondValue !== fb.uint8Array.length) {
          throw new Error(`DataCorruption! Expected ${fb.uint8Array.length} but got ${secondValue}`);
        }
        this.decompressLZW(fb);
        // Maybe the check for size should be afterwards?
        return;
      }
      // TODO: Implement the other compression methods.
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
}


