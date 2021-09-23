#pragma once

#include "bak/dialogTarget.hpp"
#include "bak/resourceNames.hpp"

#include "graphics/glm.hpp"

#include "xbak/FileBuffer.h"

#include <glm/glm.hpp>

#include <iostream>

/*
DEF_TOWN.DAT
0d00 0000 14
     town tag    entry dg  exit dg xo yo transition
0127 0001 0000 00 68e31600 69e31600 10 14 0040 01 0000 
0127 0002 0000 00 74e31600 75e31600 0b 08 00a0 01 0000 
0127 0005 0000 00 99e31600 9ae31600 0a 20 0000 01 0000 
0127 000c 0000 00 dee31600 dfe31600 15 1c 0000 01 0000 
0127 0003 0000 00 86e31600 87e31600 1b 06 0060 01 0000 
0127 000b 0000 00 d5e31600 d6e31600 12 09 00c0 01 0000 
0127 0006 0000 00 a1e31600 a2e31600 13 1a 00a0 01 0000 
0127 0009 0000 00 bee31600 bfe31600 06 15 0040 01 0000 
0117 0008 0000 00 b5e31600 b6e31600 23 1d 00c0 01 0000 
0107 0007 0000 00 a8e31600 a9e31600 0c 24 0000 01 0000 
0108 0004 0000 00 90e31600 91e31600 15 22 0000 01 0000 
0108 000a 0000 00 c9e31600 cae31600 0f 12 0040 01 0000 
00ff 030c 0000 00 dee31600 dfe31600 09 15 0080 00 0000 

*/

namespace BAK {

struct Town
{
    std::uint8_t mTownTag;
    std::uint8_t mTownTag2;
    KeyTarget mEntryDialog;
    KeyTarget mExitDialog;

    glm::vec<2, int> mDestOffset;
    std::uint32_t mTransitionStyle;
};

std::ostream& operator<<(std::ostream& os, const Town& town)
{
    os << "Town { Tag: (" << +town.mTownTag << ", " << +town.mTownTag2 << ") "
        << " Entry: " << town.mEntryDialog << " Exit: " << town.mExitDialog 
        << " DestOffset: " << town.mDestOffset << " Style: " << town.mTransitionStyle << "}";
    return os;
}

std::vector<Town> LoadTowns()
{
    std::vector<Town> towns{};

    auto fb = FileBufferFactory::CreateFileBuffer(TOWN_DEFINITIONS);

    const unsigned nTowns = fb.GetUint16LE();
	fb.DumpAndSkip(4);

    for (unsigned i = 0; i < nTowns; i++)
    {
        const unsigned tag = fb.GetUint8();
        const unsigned tag2 = fb.GetUint8();
        fb.DumpAndSkip(3);
        const auto entryDialog = KeyTarget{fb.GetUint32LE()};
        const auto exitDialog  = KeyTarget{fb.GetUint32LE()};
        const int xOff = fb.GetUint8();
        const int yOff = fb.GetUint8();
        fb.DumpAndSkip(1);
        const int transition = fb.GetUint8();
        fb.DumpAndSkip(1);
		fb.DumpAndSkip(4);

        towns.emplace_back(
            tag,
            tag2,
            entryDialog,
            exitDialog,
            glm::vec<2, int>{xOff, yOff},
            transition);
        std::cout << towns.back() << "\n";
    }

    return towns;
}

}
