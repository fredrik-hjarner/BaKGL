import { FileBuffer } from './file/fileBuffer';
import { DataTag } from './dataTags';
import { extractedDataPath } from '../consts';
import { readdir } from 'node:fs/promises';

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export class ColorSwap {
  public static readonly SIZE = 256;
  private indices: number[];

  private constructor(indices: number[]) {
    this.indices = indices;
  }

  public static async createFromFile(filename: string): Promise<ColorSwap> {
    const fb = await FileBuffer.createFromFile(filename);
    const indices: number[] = [];

    for (let i = 0; i < ColorSwap.SIZE; i++) {
      indices.push(fb.getUint8());
    }

    return new ColorSwap(indices);
  }

  public getColor(i: number, pal: Palette): Color {
    if (i >= ColorSwap.SIZE) {
      throw new Error(`Index out of bounds: ${i}`);
    }
    return pal.getColor(this.indices[i]);
  }
}

export class Palette {
  private colors: Color[];

  private constructor(colors: Color[]) {
    this.colors = colors;
  }

  public static async createFromFile(filename: string): Promise<Palette> {
    const fb = await FileBuffer.createFromFile(filename);
    const palbuf = fb.find(DataTag.VGA);
    const size = palbuf.uint8Array.length / 3;
    const colors: Color[] = [];

    // const F = (x: number) => {
    //     console.log(`Palette.createFromFile: x: ${x}`);
    //     console.log(`Palette.createFromFile: (x << 2): ${x << 2}`);
    //     console.log(`Palette.createFromFile: ((x << 2) / 255): ${((x << 2) / 255).toFixed(2)}`);
    //     return (x << 2) / 255;
    // }
    const F = (x: number) => {
        const result = (x << 2);
        // console.log(`Palette.createFromFile: result: ${result}`);
        // console.log(`Palette.createFromFile: x: ${x}`);
        // console.log(`Palette.createFromFile: (x << 2): ${x << 2}`);
        return result;
    }

    for (let i = 0; i < size; i++) {
      const r = F(palbuf.getUint8());
      const g = F(palbuf.getUint8());
      const b = F(palbuf.getUint8());
      const a = i === 0 ? 0 : 1;
      colors.push({ r, g, b, a });
    }

    return new Palette(colors);
  }

  public static async createFromPalette(pal: Palette, cs: ColorSwap): Promise<Palette> {
    const colors: Color[] = [];

    for (let i = 0; i < 256; i++) {
      colors.push(cs.getColor(i, pal));
    }

    return new Palette(colors);
  }

  public getColor(i: number): Color {
    if (i >= this.colors.length) {
      throw new Error(`Index out of bounds: ${i}`);
    }
    return this.colors[i];
  }
}

export async function extractPalettesToJson(): Promise<void> {
  const allFiles = await readdir(extractedDataPath);
//   console.log(`extractPalettesToJson: allFiles: ${JSON.stringify(allFiles, null, 2)}`);
  const palFilePaths = allFiles
    .filter(file => file.toLowerCase().endsWith('.pal'))
    .map(file => `${extractedDataPath}/${file}`);
//   console.log(`extractPalettesToJson: palFilePaths: ${JSON.stringify(palFilePaths, null, 2)}`);
  const fileNames = palFilePaths.map(path => path.split('/').pop());
//   console.log(`extractPalettesToJson: fileNames: ${JSON.stringify(fileNames, null, 2)}`);
  const pathAndFileNames = palFilePaths.map((path, i) => ({ path, fileName: fileNames[i] }));   
//   console.log(`extractPalettesToJson: pathAndFileNames: ${JSON.stringify(pathAndFileNames, null, 2)}`);

  for (const { path: palFilePath, fileName } of pathAndFileNames) {
    const palette = await Palette.createFromFile(palFilePath);
    const jsonFileName = `${fileName!.slice(0, -4)}.PAL.json`;
    const jsonFilePath = `${extractedDataPath}/step2/PAL/${jsonFileName}`;
    
    console.log(`extractPalettesToJson: jsonFilePath: ${JSON.stringify(jsonFilePath, null, 2)}`);
    await Bun.write(jsonFilePath, JSON.stringify(palette, null, 2));
  }
}
