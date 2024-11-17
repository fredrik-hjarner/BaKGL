export class BmpWriter {
  private static BMP_HEADER_SIZE = 54;

  static createBmpArray(
    width: number,
    height: number,
    // [r, g, b, r, g, b, r, g, b...]
    pixels: Uint8Array,
    forOpenGL = false  // Single flag to control OpenGL optimization
  ): Uint8Array {
    const rowSizeWithoutPadding = width * 3;
    // Always use 4-byte alignment (safe for both OpenGL and standard viewers)
    const howMuchWeNeedToAddPerRow = (() => {
      switch(rowSizeWithoutPadding % 4) {
        // even number of bytes
        case 0: return 0;

        // 3 bytes above even number of bytes, need to add 1 byte to make it even with 4 bytes
        case 3: return 1;

        // 2 bytes above even number of bytes, need to add 2 bytes to make it even with 4 bytes
        case 2: return 2;

        // 1 byte above even number of bytes, need to add 3 bytes to make it even with 4 bytes
        case 1: return 3;

        default:
          throw new Error(`Unexpected rowSizeWithoutPadding % 4: ${rowSizeWithoutPadding % 4}`);
      }
    })();
    const rowSize = rowSizeWithoutPadding + howMuchWeNeedToAddPerRow;
    const imageSize = rowSize * height;
    const fileSize = BmpWriter.BMP_HEADER_SIZE + imageSize;
    
    const array = new Uint8Array(fileSize);
    const dataView = new DataView(array.buffer);
    
    let pos = 0; // Variable to track the current position
    
    // Standard BMP header
    array[0] = 0x42; // 'B'
    array[1] = 0x4D; // 'M'
    pos += 2;
    
    dataView.setUint32(pos, fileSize, true);
    pos += 4;
    console.assert(pos === 6, `Unexpected buffer position after fileSize. Expected 6, but got ${pos}`);

    dataView.setUint32(pos, 0, true);
    pos += 4;
    console.assert(pos === 10, `Unexpected buffer position after reserved. Expected 10, but got ${pos}`);

    dataView.setUint32(pos, BmpWriter.BMP_HEADER_SIZE, true);
    pos += 4;
    console.assert(pos === 14, `Unexpected buffer position after data offset. Expected 14, but got ${pos}`);
    
    // DIB header
    dataView.setUint32(pos, 40, true);
    pos += 4;
    console.assert(pos === 18, `Unexpected buffer position after header size. Expected 18, but got ${pos}`);

    dataView.setInt32(pos, width, true);
    pos += 4;
    console.assert(pos === 22, `Unexpected buffer position after width. Expected 22, but got ${pos}`);

    dataView.setInt32(pos, forOpenGL ? -height : height, true);
    pos += 4;
    console.assert(pos === 26, `Unexpected buffer position after height. Expected 26, but got ${pos}`);

    dataView.setUint16(pos, 1, true);
    pos += 2;
    console.assert(pos === 28, `Unexpected buffer position after planes. Expected 28, but got ${pos}`);

    dataView.setUint16(pos, 24, true);
    pos += 2;
    console.assert(pos === 30, `Unexpected buffer position after bits per pixel. Expected 30, but got ${pos}`);

    dataView.setUint32(pos, 0, true);
    pos += 4;
    console.assert(pos === 34, `Unexpected buffer position after compression. Expected 34, but got ${pos}`);

    dataView.setUint32(pos, 0, true);
    pos += 4;
    console.assert(pos === 38, `Unexpected buffer position after image size. Expected 38, but got ${pos}`);

    dataView.setInt32(pos, 2835, true);
    pos += 4;
    console.assert(pos === 42, `Unexpected buffer position after x resolution. Expected 42, but got ${pos}`);

    dataView.setInt32(pos, 2835, true);
    pos += 4;
    console.assert(pos === 46, `Unexpected buffer position after y resolution. Expected 46, but got ${pos}`);

    dataView.setUint32(pos, 0, true);
    pos += 4;
    console.assert(pos === 50, `Unexpected buffer position after color palette. Expected 50, but got ${pos}`);

    dataView.setUint32(pos, 0, true);
    pos += 4;
    console.assert(pos === 54, `Unexpected buffer position after important colors. Expected 54, but got ${pos}`);
    console.assert(pos === BmpWriter.BMP_HEADER_SIZE, `Buffer position should be at BMP_HEADER_SIZE. Expected ${BmpWriter.BMP_HEADER_SIZE}, but got ${pos}`);
    
    // Write pixel data
    let offset = BmpWriter.BMP_HEADER_SIZE;
    
    // Write rows in the appropriate order
    for (let y = 0; y < height; y++) {
      const rowY = forOpenGL ? y : (height - 1 - y);
      for (let x = 0; x < width; x++) {
        const i = (rowY * width + x) * 3;
        array[offset++] = pixels[i + 2];  // Blue
        array[offset++] = pixels[i + 1];  // Green
        array[offset++] = pixels[i];      // Red
      }
      // Pad row to 4 bytes
      for (let i = 0; i < howMuchWeNeedToAddPerRow; i++) {
        array[offset++] = 0;
      }
    }
    
    return array;
  }
}

// // Example usage:
// const width = 256;
// const height = 256;

// {
//   const pixels = new Uint8Array(width * height * 3);
//   // Create a test pattern
//   for (let y = 0; y < height; y++) {
//     for (let x = 0; x < width; x++) {
//       const i = (y * width + x) * 3;
//       pixels[i] = x * 255 / width;      // R
//       pixels[i + 1] = y * 255 / height; // G
//       pixels[i + 2] = 128;              // B
//     }
//   }
//   // Create two versions of the same image
//   const normalBmp = BmpWriter.createBmpArray(width, height, pixels, false);
//   const openglBmp = BmpWriter.createBmpArray(width, height, pixels, true);
  
//   // dump to filsystem with Bun.file
//   Bun.write('normal.bmp', normalBmp);
//   Bun.write('opengl.bmp', openglBmp);
// }

// {
//   // totally red
//   const pixels = new Uint8Array(width * height * 3);
//   for (let i = 0; i < pixels.length; i += 3) {
//     if(i === 0) {
//       pixels[i] = 255;
//       pixels[i + 1] = 255;
//       pixels[i + 2] = 255;
//     } else {
//       pixels[i] = 255;
//       pixels[i + 1] = 0;
//       pixels[i + 2] = 0;
//     }
//   }
//   const bmp = BmpWriter.createBmpArray(width, height, pixels, false);
//   Bun.write('red.bmp', bmp);
// }
