export class BmpWriter {
  private static BMP_HEADER_SIZE = 54;

  static createBmpArray(
    width: number,
    height: number,
    pixels: Uint8Array,
    forOpenGL = false  // Single flag to control OpenGL optimization
  ): Uint8Array {
    // Always use 4-byte alignment (safe for both OpenGL and standard viewers)
    const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
    const imageSize = rowSize * height;
    const fileSize = BmpWriter.BMP_HEADER_SIZE + imageSize;
    
    const array = new Uint8Array(fileSize);
    const dataView = new DataView(array.buffer);
    
    // Standard BMP header
    array[0] = 0x42; // 'B'
    array[1] = 0x4D; // 'M'
    dataView.setUint32(2, fileSize, true);
    dataView.setUint32(6, 0, true);
    dataView.setUint32(10, BmpWriter.BMP_HEADER_SIZE, true);
    
    // DIB header
    dataView.setUint32(14, 40, true);                // Header size
    dataView.setInt32(18, width, true);              // Width
    dataView.setInt32(22, forOpenGL ? -height : height, true); // Height (negative means top-to-bottom)
    dataView.setUint16(26, 1, true);                 // Planes
    dataView.setUint16(28, 24, true);                // Bits per pixel
    dataView.setUint32(30, 0, true);                 // No compression
    dataView.setUint32(34, imageSize, true);         // Image size
    dataView.setInt32(38, 2835, true);               // X resolution (72 DPI)
    dataView.setInt32(42, 2835, true);               // Y resolution (72 DPI)
    dataView.setUint32(46, 0, true);                 // Color palette
    dataView.setUint32(50, 0, true);                 // Important colors
    
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
      while (offset % 4 !== 0) {
        array[offset++] = 0;
      }
    }
    
    return array;
  }
}

// // Example usage:
// const width = 256;
// const height = 256;
// const pixels = new Uint8Array(width * height * 3);

// // Create a test pattern
// for (let y = 0; y < height; y++) {
//   for (let x = 0; x < width; x++) {
//     const i = (y * width + x) * 3;
//     pixels[i] = x * 255 / width;      // R
//     pixels[i + 1] = y * 255 / height; // G
//     pixels[i + 2] = 128;              // B
//   }
// }

// // Create two versions of the same image
// const normalBmp = BmpWriter.createBmpArray(width, height, pixels, false);
// const openglBmp = BmpWriter.createBmpArray(width, height, pixels, true);

// // dump to filsystem with Bun.file
// Bun.write('normal.bmp', normalBmp);
// Bun.write('opengl.bmp', openglBmp);