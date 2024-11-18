#include "bak/imageStore.hpp"
#include "bak/dataTags.hpp"

#include "com/logger.hpp"

#include <iostream>

namespace BAK {

// create a logger for this file.
const auto logger = Logging::LogState::GetLogger("imageStore");

std::vector<Image> LoadImagesNormal(FileBuffer& fb)
{
    std::vector<Image> images{};

    const unsigned compression = fb.GetUint16LE();
    logger.Info() << "compression: " << compression << std::endl;
    const unsigned numImages = fb.GetUint16LE();
    logger.Info() << "numImages: " << numImages << std::endl;
    std::vector<unsigned> imageSizes{};
    fb.Skip(2);
    unsigned int size = fb.GetUint32LE();
    logger.Info() << "size: " << size << std::endl;
    for (unsigned i = 0; i < numImages; i++)
    {
        const auto imageSize = fb.GetUint16LE();
        logger.Info() << "imageSize: " << imageSize << std::endl;
        imageSizes.emplace_back(imageSize);
        unsigned flags = fb.GetUint16LE();
        logger.Info() << "flags: " << flags << std::endl;
        unsigned width = fb.GetUint16LE();
        logger.Info() << "width: " << width << std::endl;
        unsigned height = fb.GetUint16LE();
        logger.Info() << "height: " << height << std::endl;
        images.emplace_back(width, height, flags, false);
    }

    if (compression == 1)
    {
        // Not sure why this is needed or if *2 is the right number
        size *= 2;
    }

    FileBuffer decompressed = FileBuffer(size);

    // Log the fb buffer
    // const uint8_t* buffer = fb.GetBuffer();
    // const size_t bufferSize = fb.GetSize();
    // std::cout << "fb.GetBuffer(): [";
    // for (size_t i = 0; i < bufferSize; ++i)
    // {
    //     std::cout << static_cast<int>(buffer[i]);
    //     if (i < bufferSize - 1)
    //         std::cout << ", ";
    // }
    // std::cout << "]" << std::endl;

    logger.Info() << "before decompress: decompressed.length: " << decompressed.GetSize() << std::endl;
    logger.Info() << "before decompress: fb.length: " << fb.GetSize() << std::endl;

    fb.Decompress(&decompressed, compression);
    for (unsigned int i = 0; i < numImages; i++)
    {
        auto imageBuffer = FileBuffer(imageSizes[i]);
        imageBuffer.Fill(&decompressed);

        {
            // Log the imageBuffer buffer
            const uint8_t* buffer = imageBuffer.GetBuffer();
            const size_t bufferSize = imageBuffer.GetSize();
            std::cout << "imageBuffer.GetBuffer(): [";
            for (size_t i = 0; i < bufferSize; ++i)
            {
                std::cout << static_cast<int>(buffer[i]);
                if (i < bufferSize - 1)
                    std::cout << ", ";
            }
            std::cout << "]" << std::endl;
        }

        images[i].Load(&imageBuffer);

        {
            // Log the images[i].pixels
            const uint8_t* pixels = images[i].GetPixels();
            const size_t pixelsSize = images[i].GetSize();
            std::cout << "images[" << i << "].pixels: [";
            for (size_t j = 0; j < pixelsSize; ++j)
            {
                std::cout << static_cast<int>(pixels[j]);
                if (j < pixelsSize - 1)
                    std::cout << ", ";
            }
        }
    }

    return images;
}

std::vector<Image> LoadImagesTagged(FileBuffer& fb)
{
    auto infBuf = fb.Find(DataTag::INF);

    std::vector<Image> images{};
    unsigned imageCount = infBuf.GetUint16LE();
    for (unsigned i = 0; i < imageCount; i++)
    {
        const auto width = infBuf.GetUint16LE();
        const auto start = infBuf.Tell();
        infBuf.Skip(2 * (imageCount - 1));
        const auto height = infBuf.GetUint16LE();
        infBuf.Seek(start);
        images.emplace_back(width, height, 0, true);
    }

    auto binBuf = fb.Find(DataTag::BIN);
    auto compression = binBuf.GetUint8();
    auto size = binBuf.GetUint32LE();
    FileBuffer decompressed = FileBuffer(size);
    auto decompressedBytes = binBuf.DecompressLZW(&decompressed);
    for (unsigned i = 0; i < imageCount; i++)
    {
        images[i].Load(&decompressed);
    }

    return images;
}

std::vector<Image> LoadImages(FileBuffer& fb)
{
    const auto imageType = fb.GetUint16LE();
    if (imageType == 0x1066)
    {
        return LoadImagesNormal(fb);
    }
    else if (imageType == 0x4d42)
    {
        return LoadImagesTagged(fb);
    }
    else
    {
        throw std::runtime_error("Couldn't load images");
        return std::vector<Image>{};
    }
}

}
