import type { Image } from '../bak/image.ts';
import { loadScreenResource } from '../bak/screen.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette, type Palette } from './pal.ts';
import { extractedDataPath } from '../consts.ts';
import { getAllPalettesNames } from '../bak/palette.ts';

const imagePalettePairs = [
    { imageFileName: 'BLANK.SCX', paletteFileName: 'INT_MENU.PAL' },
    { imageFileName: 'BOOK.SCX', paletteFileName: 'BOOK.PAL' },
    { imageFileName: 'C11.SCX', paletteFileName: 'C11A.PAL' },
    { imageFileName: 'C42.SCX', paletteFileName: 'TELEPORT.PAL' },
    { imageFileName: 'CAST.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CFRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CHAPTER.SCX', paletteFileName: 'CHAPTER.PAL' },
    { imageFileName: 'CONT2.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'CONTENTS.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'CREDITS.SCX', paletteFileName: 'CREDITS.PAL' },
    { imageFileName: 'DIALOG.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'ENCAMP.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FCOMBAT.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FULLMAP.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INT_BORD.SCX', paletteFileName: 'INT_DYN.PAL' },
    { imageFileName: 'INT_MENU.SCX', paletteFileName: 'INT_MENU.PAL' },
    { imageFileName: 'INVENTOR.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'OPTIONS0.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS1.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS2.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'PUZZLE.SCX', paletteFileName: 'PUZZLE.PAL' },
    { imageFileName: 'RIFTMAP.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'Z01L.SCX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z02L.SCX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z03L.SCX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z04L.SCX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z05L.SCX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z06L.SCX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z07L.SCX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z08L.SCX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z09L.SCX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z10L.SCX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z11L.SCX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z12L.SCX', paletteFileName: 'Z12.PAL' },
];

// a function that write actors in the format {"ACT001", "ACT001.PAL"}, one such per line
const pairsToCppMap = async (pairs: { imageFileName: string, paletteFileName: string }[]) => {
    // remove the ones that have the same string before the dot
    // pairs = pairs.filter((pair) => pair.imageFileName.split('.')[0] !== pair.paletteFileName.split('.')[0]);
    const result = pairs.map((pair) => `{"${pair.imageFileName}", "${pair.paletteFileName}"},`).join("\n");
    await Bun.write("~/Desktop/actors2.json", result);
}
pairsToCppMap(imagePalettePairs);

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

const renderScxWithAllPalettes = async (imageFileName: string) => {
    const image = await loadScreenResource(`${extractedDataPath}/${imageFileName}`);

    const palettePaths = await getAllPalettesNames();
    const palettes: Palette[] = [];
    for (const palettePath of palettePaths) {
        const palette = await loadPalette(palettePath);
        palettes.push(palette);
    }

    for (const [i, palette] of palettes.entries()) {
        dumpBmp({ imageFileName: `${imageFileName}__${palette.fileName}`, image, palette });
    }
}

export const experimentScx = async () => {
    await dumpAllBmp(false);
    // await renderScxWithAllPalettes('INT_MENU.SCX');
}
