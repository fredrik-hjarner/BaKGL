export class FileBuffer {
  public uint8Array: Uint8Array;
  private index: number = 0;

  constructor(uint8Array: Uint8Array) {
    this.uint8Array = uint8Array;
  }

  static async createFromFile(path: string): Promise<FileBuffer> {
    const file = Bun.file(path);
    const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    return new FileBuffer(uint8Array);
  }

  loadUint8Vector(length: number): number[] {
    const vector: number[] = [];
    for (let i = 0; i < length; i++) {
      vector.push(this.getUint8());
    }
    return vector;
  }

//   void
// FileBuffer::Skip(const int n)
// {
//     if ((mCurrent) && (mCurrent + n <= mBuffer + mSize))
//     {
//         mCurrent += n;
//     }
// }

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
}


