// import './bak/file/packedFileProvider.ts';
// import './bak/fmap.ts';
import type { Image } from './bak/image.ts';
import { loadImages } from './bak/imageStore.ts';
import { extractPalettesToJson } from './bak/palette.ts';
import { BmpWriter } from './bmp.ts';

await extractPalettesToJson();

// POINTERG.BMX uses OPTIONS.PAL palette maybe...
const images = await loadImages('POINTERG.BMX');
// BICONS1.BMX uses OPTIONS.PAL palette
// loadImages('BICONS1.BMX');

const dumpBmp = (image: Image, index: number) => {
    const imageWithColors = Array.from(image.pixels).flatMap((paletteIndex) => {
        return [paletteIndex*16, paletteIndex*16, paletteIndex*16];
    });
    console.log({imageWithColors});
    
    // now use BmpWriter to write to file
    const bmp = BmpWriter.createBmpArray(image.width, image.height, Uint8Array.from(imageWithColors));
    Bun.write(`image${index}.bmp`, bmp);
}

images.forEach((image, index) => {
    dumpBmp(image, index);
});
