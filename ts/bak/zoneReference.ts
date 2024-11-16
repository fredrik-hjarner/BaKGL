// #include "com/logger.hpp"

// #include "graphics/glm.hpp"

// #include "bak/fileBufferFactory.hpp"

// namespace BAK {

// std::vector<glm::uvec2> LoadZoneRef(const std::string& path)
// {
//     auto fb = FileBufferFactory::Get().CreateDataBuffer(path);
//     const auto logger = Logging::LogState::GetLogger("LoadZoneRef");

//     const auto numberTiles = fb.GetUint8();
//     logger.Spam() << "Number of tiles: " << numberTiles << "\n";

//     std::vector<glm::uvec2> tiles{};
//     tiles.reserve(numberTiles);

//     for (unsigned i = 0; i < numberTiles; i++)
//     {
//         const auto& tile = tiles.emplace_back(
//             fb.LoadVector<std::uint8_t, 2>());
//         logger.Spam() << std::hex << tile << " " << i << std::dec << "\n";
//     }

//     return tiles;
// }

// }

// IMPORTANT: The code above is for reference! I want to do the same thing in typescript.

import { FileBuffer } from "./file/fileBuffer.ts";
import { extractedDataPath } from "../consts.ts";

export async function loadZoneRef(file: string): Promise<{ x: number; y: number }[]> {
    const path = `${extractedDataPath}/${file}`;
    const fb = await FileBuffer.createFromFile(path);
    const numTiles = fb.getUint8();
    console.log(`Number of tiles: ${numTiles}`);
    const tiles: { x: number; y: number }[] = [];
    for (let i = 0; i < numTiles; i++) {
        const tile = fb.loadUint8Vector(2);
        tiles.push({ x: tile[0], y: tile[1] });
        // console.log(`Tile ${i}: ${tile[0]}, ${tile[1]}`);
        // logger.Spam() << std::hex << tile << " " << i << std::dec << "\n";
        console.log(`${tile[0]} ${tile[1]} ${i}`)
    }
    return tiles;
}
