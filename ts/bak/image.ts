import { FileBuffer } from './file/fileBuffer';

const FLAG_XYSWAPPED  = 0x20;
const FLAG_UNKNOWN    = 0x40;
const FLAG_COMPRESSED = 0x80;

interface ImageOptions {
  width: number;
  height: number;
  flags: number;
  isHighResLowCol: boolean;
  pixels?: Uint8Array;
}

export class Image {
  public width: number;
  public height: number;
  public flags: number;
  public isHighResLowCol: boolean;
  public pixels: Uint8Array;

  constructor(options: ImageOptions) {
    this.width = options.width;
    this.height = options.height;
    this.flags = options.flags;
    this.isHighResLowCol = options.isHighResLowCol;
    this.pixels = options.pixels || new Uint8Array(options.width * options.height);
  }

  getPixel(x: number, y: number): number {
    return this.pixels[x + this.width * y];
  }

  setPixel(x: number, y: number, color: number): void {
    if (x < this.width && y < this.height) {
      this.pixels[x + this.width * y] = color;
    }
  }

  load(buffer: FileBuffer): void {
    if (this.pixels.length !== this.width * this.height) {
      throw new Error(`Invalid image dimensions: ${this.width}x${this.height} (expected ${this.pixels.length} pixels)`);
    }
    
    let imgbuf: FileBuffer;
    if (this.flags & FLAG_COMPRESSED) {
      imgbuf = FileBuffer.createEmpty(this.width * this.height);
      buffer.decompressRLE(imgbuf);
    } else {
      imgbuf = buffer;
    }

    if (this.flags & FLAG_XYSWAPPED) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          this.setPixel(x, y, imgbuf.getUint8());
        }
      }
    } else {
      if (this.isHighResLowCol) {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const c = imgbuf.getUint8();
            this.setPixel(x, y, (c & 0xf0) >> 4);
            x++;
            this.setPixel(x, y, c & 0x0f);
          }
        }
      } else {
        for (let i = 0; i < this.width * this.height; i++) {
          this.pixels[i] = imgbuf.getUint8();
        }
      }
    }
  }
}
