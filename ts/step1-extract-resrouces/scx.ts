import type { Image } from '../bak/image.ts';
import { loadScreenResource } from '../bak/screen.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette, type Palette } from './pal.ts';
import { extractedDataPath } from '../consts.ts';

// await extractPalettesToJson();

const imagePalettePairs = [
    /////////////////////////////
    // SCX with known palettes //
    /////////////////////////////
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
    // INT_BORD look weird.
    { imageFileName: 'INT_BORD.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INVENTOR.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'OPTIONS0.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS1.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS2.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'PUZZLE.SCX', paletteFileName: 'PUZZLE.PAL' },
    { imageFileName: 'RIFTMAP.SCX', paletteFileName: 'OPTIONS.PAL' },
]

type DumpBmpParams = {
    imageFileName: string;
    image: Image;
    palette: Palette;
}

const dumpBmp = ({ imageFileName, image, palette }: DumpBmpParams) => {
    const imageWithColors = Array.from(image.pixels).flatMap((paletteIndex) => {
        const color = palette.colors[paletteIndex];
        return [color.r, color.g, color.b];
    });
    // console.log({imageWithColors});
    
    // now use BmpWriter to write to file
    const bmp = BmpWriter.createBmpArray(image.width, image.height, Uint8Array.from(imageWithColors));
    Bun.write(`${extractedDataPath}/step2/SCX/${imageFileName}.bmp`, bmp);
}

const dumpAllBmp = async (cleanFirst: boolean = false) => {
    if (cleanFirst) {
        throw new Error('Not implemented');
    }
    for (const { imageFileName, paletteFileName } of imagePalettePairs) {
        const image = await loadScreenResource(`${extractedDataPath}/${imageFileName}`);
        const palette = await loadPalette(paletteFileName);

        dumpBmp({ imageFileName, image, palette });
    }
}

export const experimentScx = async () => {
    await dumpAllBmp(false);
}
