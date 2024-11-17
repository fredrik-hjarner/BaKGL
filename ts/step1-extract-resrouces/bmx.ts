import type { Image } from '../bak/image.ts';
import { loadImages } from '../bak/imageStore.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette, type Palette } from './pal.ts';
import { extractedDataPath } from '../consts.ts';

// await extractPalettesToJson();

const scxPairs = [
    { imageFileName: 'BOOK.SCX', paletteFileName: 'BOOK.PAL' },
    { imageFileName: 'C42.SCX', paletteFileName: 'TELEPORT.PAL' },
    { imageFileName: 'CAST.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CFRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CONT2.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'CONTENTS.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'DIALOG.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'ENCAMP.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FULLMAP.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INT_BORD.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INVENTOR.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'OPTIONS0.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS1.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS2.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'PUZZLE.SCX', paletteFileName: 'PUZZLE.PAL' },
    { imageFileName: 'RIFTMAP.SCX', paletteFileName: 'OPTIONS.PAL' },
]

const imagePalettePairs = [
    { imageFileName: 'BICONS1.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'BICONS2.BMX', paletteFileName: 'OPTIONS.PAL' },
    // { imageFileName: 'CASTFACE.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'COMPASS.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'ENCAMP.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FMAP_ICN.BMX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'HEADS.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVLOCK.BMX', paletteFileName: 'OPTIONS.PAL' },
    // { imageFileName: 'INVMISC.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVSHP1.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVSHP2.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'POINTERG.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'TELEPORT.BMX', paletteFileName: 'TELEPORT.PAL' }
];

type DumpBmpParams = {
    imagesFileName: string;
    image: Image;
    palette: Palette;
    index: number;
}

const dumpBmp = ({ imagesFileName, image, palette, index }: DumpBmpParams) => {
    const imageWithColors = Array.from(image.pixels).flatMap((paletteIndex) => {
        const color = palette.colors[paletteIndex];
        return [color.r, color.g, color.b];
    });
    console.log({imageWithColors});
    
    // now use BmpWriter to write to file
    const bmp = BmpWriter.createBmpArray(image.width, image.height, Uint8Array.from(imageWithColors));
    Bun.write(`${extractedDataPath}/step2/BMX/${imagesFileName.replace('.BMX', '')}_${index}.BMX.bmp`, bmp);
}

const dumpAllBmp = async () => {
    for (const {imageFileName, paletteFileName} of imagePalettePairs) {
        const images = await loadImages(imageFileName);
        const palette = await loadPalette(paletteFileName);

        images.forEach((image, index) => {
            dumpBmp({imagesFileName: imageFileName, image, palette, index});
        });
    }
}

export const experiment = async () => {
    await dumpAllBmp();
}
