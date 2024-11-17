// #pragma once

// #include "bak/image.hpp"

// #include "bak/fileBufferFactory.hpp"

// namespace BAK {

// std::vector<Image> LoadImages(FileBuffer& fb);

// }

// #include "bak/imageStore.hpp"
// #include "bak/dataTags.hpp"

// #include "com/logger.hpp"

// #include <iostream>

// namespace BAK {

// std::vector<Image> LoadImagesNormal(FileBuffer& fb)
// {
//     std::vector<Image> images{};

//     const unsigned compression = fb.GetUint16LE();
//     const unsigned numImages = fb.GetUint16LE();

//     std::vector<unsigned> imageSizes{};
//     fb.Skip(2);
//     unsigned int size = fb.GetUint32LE();
//     for (unsigned i = 0; i < numImages; i++)
//     {
//         imageSizes.emplace_back(fb.GetUint16LE());
//         unsigned flags = fb.GetUint16LE();
//         unsigned width = fb.GetUint16LE();
//         unsigned height = fb.GetUint16LE();
//         images.emplace_back(width, height, flags, false);
//     }

//     if (compression == 1)
//     {
//         // Not sure why this is needed or if *2 is the right number
//         size *= 2;
//     }

//     FileBuffer decompressed = FileBuffer(size);
//     fb.Decompress(&decompressed, compression);
//     for (unsigned int i = 0; i < numImages; i++)
//     {
//         auto imageBuffer = FileBuffer(imageSizes[i]);
//         imageBuffer.Fill(&decompressed);
//         images[i].Load(&imageBuffer);
//     }

//     return images;
// }

// std::vector<Image> LoadImagesTagged(FileBuffer& fb)
// {
//     auto infBuf = fb.Find(DataTag::INF);

//     std::vector<Image> images{};
//     unsigned imageCount = infBuf.GetUint16LE();
//     for (unsigned i = 0; i < imageCount; i++)
//     {
//         const auto width = infBuf.GetUint16LE();
//         const auto start = infBuf.Tell();
//         infBuf.Skip(2 * (imageCount - 1));
//         const auto height = infBuf.GetUint16LE();
//         infBuf.Seek(start);
//         images.emplace_back(width, height, 0, true);
//     }

//     auto binBuf = fb.Find(DataTag::BIN);
//     auto compression = binBuf.GetUint8();
//     auto size = binBuf.GetUint32LE();
//     FileBuffer decompressed = FileBuffer(size);
//     auto decompressedBytes = binBuf.DecompressLZW(&decompressed);
//     for (unsigned i = 0; i < imageCount; i++)
//     {
//         images[i].Load(&decompressed);
//     }

//     return images;
// }

// std::vector<Image> LoadImages(FileBuffer& fb)
// {
//     const auto imageType = fb.GetUint16LE();
//     if (imageType == 0x1066)
//     {
//         return LoadImagesNormal(fb);
//     }
//     else if (imageType == 0x4d42)
//     {
//         return LoadImagesTagged(fb);
//     }
//     else
//     {
//         throw std::runtime_error("Couldn't load images");
//         return std::vector<Image>{};
//     }
// }

// }

// IMPORTANT: The code above is from c++ project and just for reference. I want to create a typescript version below.

import { FileBuffer } from "./file/fileBuffer.ts";
import { extractedDataPath } from "../consts.ts";
import { COMPRESSION_LZSS } from "./file/fileBuffer.ts";

type Image = any; // TODO: Fix type.

function log(message: string) {
    console.log(`[imageStore.ts/loadImages] ${message}`);
}

// loads images from a *.BMX file.
export function loadImagesNormal(fb: FileBuffer): Image[] {
    const images: Image[] = [];

    // TODO: What are the different compression types?
    // static constexpr auto COMPRESSION_LZW  = 0;
    // static constexpr auto COMPRESSION_LZSS = 1;
    // static constexpr auto COMPRESSION_RLE  = 2;
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
        images.push({
            width,
            height,
            flags,
            isHighResLowCol: false,
        });
    }

    log(`imageSizes: ${JSON.stringify(imageSizes)}`);
    log(`images: ${JSON.stringify(images, null, 2)}`);

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
    fb.decompress(decompressedFileBuffer, compression);
    for (let i = 0; i < numImages; i++) {
        const imageBuffer = FileBuffer.createEmpty(imageSizes[i]);
        imageBuffer.fill(decompressedFileBuffer);
        // images[i].load(imageBuffer);
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
    // } else if (imageType === 0x4d42) {
    //     return loadImagesTagged(resourceFile);
    } else {
        throw new Error(`Couldn't load images`);
    }
}
