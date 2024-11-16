// #pragma once

// #include "bak/resourceNames.hpp"
// #include "bak/types.hpp"
// #include "bak/zoneReference.hpp"

// #include "com/assert.hpp"
// #include "com/logger.hpp"
// #include "com/ostream.hpp"

// #include "graphics/glm.hpp"

// #include "bak/fileBufferFactory.hpp"

// namespace BAK {

// class FMapXY
// {
// public:
//     static constexpr auto sFile = "FMAP_XY.DAT";

//     FMapXY()
//     {
//         auto fb = FileBufferFactory::Get().CreateDataBuffer(sFile);
//         unsigned i = 0;

//         for (unsigned zone = 0; zone < 12; zone++)
//         {
//             mTiles.emplace_back(LoadZoneRef(ZoneLabel{zone + 1}.GetZoneReference()));
//             unsigned i = 0;
//             const auto nTiles = fb.GetUint16LE();
//             Logging::LogDebug("FMAP") << "Tiles in zone: " << (zone + 1) << ": " << nTiles << std::endl;
//             auto& tileCoords = mTileCoords.emplace_back();
//             for (unsigned i = 0; i < nTiles; i++)
//             {
//                 const auto x = fb.GetUint16LE();
//                 const auto y = fb.GetUint16LE();
//                 tileCoords.emplace_back(x, y);
//                 Logging::LogDebug("FMAP") << zone + 1 << " " << i 
//                     << " " << mTiles.back()[i] << " ( " << x << ", " << y << ")\n";
//             }
//         }
//     }

//     glm::vec2 GetTileCoords(ZoneNumber zone, glm::uvec2 tile)
//     {
//         const auto& tiles = mTiles[zone.mValue - 1];
//         const auto it = std::find(tiles.begin(), tiles.end(), tile);
//         // Obviously this should not happen, but since I haven't implemented clipping it can
//         if (it == tiles.end())
//             return glm::vec2{0, 0};
//         //ASSERT(it != tiles.end());
//         const auto index = std::distance(tiles.begin(), it);
//         // There's no full map for Timirianya
//         if (zone.mValue == 9)
//         {
//             return glm::vec2{0, 0};
//         }
//         return mTileCoords[zone.mValue - 1][index];
//     }

// private:
//     std::vector<std::vector<glm::uvec2>> mTiles;
//     std::vector<std::vector<glm::vec2>> mTileCoords;
// };

// IMPORTANT: The code above is for reference! I want to do the same thing in typescript.

import { extractedDataPath } from "../consts.ts";
import { FileBuffer } from "./file/fileBuffer.ts";
import { ZoneLabel } from "./resourceNames.ts";
import { loadZoneRef } from "./zoneReference.ts";

const fmapXyDatPath = `${extractedDataPath}/FMAP_XY.DAT`;
const fb = await FileBuffer.createFromFile(fmapXyDatPath);

const mTiles: { x: number; y: number }[][] = [];
const mTileCoords: { x: number; y: number }[][] = [];

for (let zone = 0; zone < 12; zone++) {
    const zoneReference = ZoneLabel.fromZoneNumber(zone + 1).getZoneReference();
    const zoneRef = await loadZoneRef(zoneReference);
    mTiles.push(zoneRef);
    const nTiles = fb.getUint16LE();
    console.log(`Tiles in zone ${zone + 1}: ${nTiles}`);
    const tileCoords: { x: number; y: number }[] = [];
    for (let i = 0; i < nTiles; i++) {
        const x = fb.getUint16LE();
        const y = fb.getUint16LE();
        tileCoords.push({ x, y });
        const lastMTile = mTiles[mTiles.length - 1][i];
        console.log(`FMAP: ${zone + 1} ${i} ${lastMTile.x} ${lastMTile.y} (${x} ${y})`);
    }
    mTileCoords.push(tileCoords);
}


