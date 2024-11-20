// import { extractPalettesToJson } from '../bak/palette.ts';

// await extractPalettesToJson();

// TODO: Duplicated type. Fix. Lots of code structure issues.
type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Palette = {
  fileName: string;
  colors: Color[];
};

import { extractedDataPath } from '../consts';

const paletteDirPath = `${extractedDataPath}/step2/PAL`;

export const loadPalette = async (fileName: string): Promise<Palette> => {
    const palette = await Bun.file(`${paletteDirPath}/${fileName}.json`).json();
    return palette;
}
