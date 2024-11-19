import { FileBuffer } from "./file/fileBuffer.ts";
import { Image } from "./image.ts";

export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 200;
export const BOOK_SCREEN_WIDTH = 640;
export const BOOK_SCREEN_HEIGHT = 350;

export async function loadScreenResource(filePath: string): Promise<Image> {
    const fb = await FileBuffer.createFromFile(filePath);

    let isBookScreen = false;

    if (fb.getUint16LE() !== 0x27b6) {
        fb.rewind();
        isBookScreen = true;
    }

    if (fb.getUint8() !== 0x02) {
        throw new Error("Could not load screen resource");
    }

    const decompressedSize = fb.getUint32LE();
    const decompressed = FileBuffer.createEmpty(decompressedSize);
    fb.decompressLZW(decompressed);
    
    const image = isBookScreen
        ? new Image({
            width: BOOK_SCREEN_WIDTH,
            height: BOOK_SCREEN_HEIGHT,
            flags: 0,
            isHighResLowCol: true
        })
        : new Image({
            width: SCREEN_WIDTH, 
            height: SCREEN_HEIGHT,
            flags: 0,
            isHighResLowCol: false
        });
    
    image.load(decompressed);
    return image;
}
