import { FileBuffer } from "./file/fileBuffer.ts";
import { extractedDataPath } from "../consts.ts";
import { COMPRESSION_LZSS } from "./file/fileBuffer.ts";
import { Image } from "./image.ts";
import { DataTag } from "./dataTags.ts";

function log(message: string) {
    console.log(`[imageStore.ts/loadImages] ${message}`);
}

// loads images from a *.BMX file. (maybe from other files???)
export function loadImagesNormal(fb: FileBuffer): Image[] {
    const images: Image[] = [];

    const compression = fb.getUint16LE();
    log(`Compression: ${compression}`);
    const numImages = fb.getUint16LE();
    log(`Number of images: ${numImages}`);

    // TODO: What is imageSizes?
    const imageSizes: number[] = [];
    fb.skip(2);
    let size = fb.getUint32LE();
    log(`Size: ${size}`);
    for (let i = 0; i < numImages; i++) {
        const imageSize = fb.getUint16LE();
        log(`Image size: ${imageSize}`);
        imageSizes.push(imageSize);
        const flags = fb.getUint16LE();
        log(`Flags: ${flags}`);
        const width = fb.getUint16LE();
        log(`Width: ${width}`);
        const height = fb.getUint16LE();
        log(`Height: ${height}`);
        images.push(new Image({
            width,
            height,
            flags,
            isHighResLowCol: false,
        }));
    }

    // log(`imageSizes: ${JSON.stringify(imageSizes)}`);
    // log(`images: ${JSON.stringify(images, null, 2)}`);

    // if (compression === 1) {
    if (compression === COMPRESSION_LZSS) {
        // Not sure why this is needed or if *2 is the right number
        // TODO: Examine the bahaviour. should be easy to see how much
        // space is needed if I decompress every single image I think.
        size *= 2;
    }

    // FileBuffer decompressed = FileBuffer(size);
    // fb.Decompress(&decompressed, compression);
    // for (unsigned int i = 0; i < numImages; i++)
    // {
    //     auto imageBuffer = FileBuffer(imageSizes[i]);
    //     imageBuffer.Fill(&decompressed);
    //     images[i].Load(&imageBuffer);
    // }

    const decompressedFileBuffer = FileBuffer.createEmpty(size);
    // console.log(`fb.uint8Array: ${fb.uint8Array}`);
    // console.log(`decompressedFileBuffer.uint8Array: ${decompressedFileBuffer.uint8Array}`);
    console.log(`before decompress: decompressedFileBuffer.length: ${decompressedFileBuffer.uint8Array.length}`);
    console.log(`before decompress: fb.length: ${fb.uint8Array.length}`);
    fb.decompress(decompressedFileBuffer, compression);
    for (let i = 0; i < numImages; i++) {
        const imageBuffer = FileBuffer.createEmpty(imageSizes[i]);
        imageBuffer.fill(decompressedFileBuffer);
        // console.log(`imageBuffer.uint8Array: ${imageBuffer.uint8Array}`);
        // console.log();
        images[i].load(imageBuffer);
        // console.log(`images[${i}].pixels: ${images[i].pixels}`);
        // TODO: Seems everything is working up to this point.
    }

    return images;
}

// loads images from a *.BMX file.
export async function loadImages(resourceFile: string): Promise<Image[]> {
    log(`Loading image ${resourceFile}`);
    const path = `${extractedDataPath}/${resourceFile}`;
    log(`Loading images from ${path}`);
    const fb = await FileBuffer.createFromFile(path);

    const imageType = fb.getUint16LE();
    log(`Image type: ${imageType}`);

    if (imageType === 0x1066) {
        return loadImagesNormal(fb);
    } else if (imageType === 0x4d42) {
        return loadImagesTagged(fb);
    } else {
        throw new Error(`Couldn't load images`);
    }
}

export function loadImagesTagged(fb: FileBuffer): Image[] {
    const infBuf = fb.find(DataTag.INF);
    const images: Image[] = [];
    
    const imageCount = infBuf.getUint16LE();
    console.log(`loadImagesTagged:Image count: ${imageCount}`);
    
    for (let i = 0; i < imageCount; i++) {
        const width = infBuf.getUint16LE();
        const start = infBuf.index;
        infBuf.skip(2 * (imageCount - 1));
        const height = infBuf.getUint16LE();
        infBuf.jumpToIndex(start);
        
        images.push(new Image({
            width,
            height,
            flags: 0,
            isHighResLowCol: true
        }));
    }

    const binBuf = fb.find(DataTag.BIN);
    const compression = binBuf.getUint8();
    const size = binBuf.getUint32LE();
    
    const decompressed = FileBuffer.createEmpty(size);
    binBuf.decompressLZW(decompressed);
    
    for (let i = 0; i < imageCount; i++) {
        images[i].load(decompressed);
    }

    return images;
}

