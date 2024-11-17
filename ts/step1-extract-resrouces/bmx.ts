// import './bak/file/packedFileProvider.ts';
// import './bak/fmap.ts';
import type { Image } from '../bak/image.ts';
import { loadImages } from '../bak/imageStore.ts';
import { extractPalettesToJson } from '../bak/palette.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette } from './pal.ts';

// await extractPalettesToJson();

// const imagesFileName = 'POINTERG.BMX';
const imagesFileName = 'BICONS1.BMX';
const paletteFileName = 'OPTIONS.PAL';

export const experiment = async () => {
    // POINTERG.BMX uses OPTIONS.PAL palette maybe...
    const images = await loadImages(imagesFileName);
    // BICONS1.BMX uses OPTIONS.PAL palette
    // loadImages('BICONS1.BMX');

    const palette = await loadPalette(paletteFileName);

    const dumpBmp = (image: Image, index: number) => {
        const imageWithColors = Array.from(image.pixels).flatMap((paletteIndex) => {
            const color = palette.colors[paletteIndex];
            return [color.r, color.g, color.b];
            // return [color.b, color.r, color.g];
        });
        console.log({imageWithColors});
        
        // now use BmpWriter to write to file
        const bmp = BmpWriter.createBmpArray(image.width, image.height, Uint8Array.from(imageWithColors));
        Bun.write(`image${index}.bmp`, bmp);
    }

    images.forEach((image, index) => {
        dumpBmp(image, index);
    });
}
