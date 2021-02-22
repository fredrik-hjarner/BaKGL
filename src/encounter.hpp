#pragma once

#include "xbak/FileBuffer.h"

#include "glm.hpp"
#include <glm/glm.hpp>

#include <iostream>
#include <vector>

namespace BAK {

enum class EncounterType : std::uint16_t
{
    Unknown1 = 0, // DEF_BKGR.DAT?? teleport??
    Combat = 1,  // DEF_COMB.DAT
    Unknown2 = 2,  // ???
    Dialog = 3,  // DEF_DIAL.DAT
    Unknown3 = 4,  // ???
    Sound = 5,  // DEF_SOUN.DAT
    Town = 6,  // DEF_TOWN.DAT
    Trap = 7,  // DEF_TRAP.DAT
    Transition = 8,  // DEF_??.DAT
    Unknown4 = 9,  // DEF_DISA.DAT
    Unknown5 = 0xa,  // DEF_ENAB.DAT
    Unknown6 = 0xb  // DEF_BLOC.DAT
};

std::string EncounterTypeToString(EncounterType t)
{
    switch (t)
    {
    case EncounterType::Unknown1: return "unknown";
    case EncounterType::Combat: return "combat";
    case EncounterType::Unknown2: return "unknown";
    case EncounterType::Dialog: return "dialog";
    case EncounterType::Unknown3: return "unknown";
    case EncounterType::Sound: return "sound";
    case EncounterType::Town: return "town";
    case EncounterType::Trap: return "trap";
    case EncounterType::Transition: return "transition";
    default: return "unknown";
    }
}

std::ostream& operator<<(std::ostream& os, EncounterType e)
{
    return os << EncounterTypeToString(e);
}

class Encounter
{
public:
    Encounter(
        EncounterType encounterType,
        unsigned encounterIndex,
        glm::vec<2, int> offset,
        glm::vec<2, unsigned> tile,
        unsigned saveAddress)
    :
        mEncounterType{encounterType},
        mEncounterIndex{encounterIndex},
        mOffset{offset},
        mTile{tile},
        mSaveAddress{saveAddress}
    {}

    auto GetOffset() const { return mOffset; }
    auto GetIndex() const { return mEncounterIndex; }
    auto GetType() const { return mEncounterType; }
    auto GetLocation() const
    {
        return glm::vec3{
            static_cast<float>(mTile[0]) * BAK::gTileSize + (static_cast<float>(GetOffset().x << 2)),
            0.0f,
            -(static_cast<float>(mTile[1]) * BAK::gTileSize + (static_cast<float>(GetOffset().y << 2)))};

    }

private:
    EncounterType mEncounterType;
    unsigned mEncounterIndex;
    glm::vec<2, int> mOffset;
    glm::vec<2, unsigned> mTile;

    // Place in the save file that is checked
    // by this encounter to see if it has
    // already been encountered
    unsigned mSaveAddress;
};

std::vector<Encounter> LoadEncounters(FileBuffer& fb, unsigned chapter, glm::vec<2, unsigned> tile)
{
    std::vector<Encounter> encounters{};
    // Ideally load all encounters... each chapter can be part of the
    // encounter type and they can be filtered later
    fb.Seek((chapter - 1) * 192);
    unsigned numberOfEncounters = fb.GetUint16LE();

    encounters.reserve(numberOfEncounters);
    
    for (unsigned i = 0; i < numberOfEncounters; i++)
    {
        auto loc = fb.Tell();
        auto encounterType = static_cast<BAK::EncounterType>(fb.GetUint16LE());
        
        int xLoc = fb.GetSint16LE();
        int yLoc = fb.GetSint16LE();
        unsigned encounterIndex = fb.GetUint16LE();
        // Don't know
        fb.GetUint16LE();
        fb.GetUint16LE();
        fb.GetUint8();
        unsigned saveAddr = fb.GetUint16LE();
        fb.GetUint16LE();
        fb.GetUint16LE();

        std::cout << "Loaded encounter: " << tile << " lc: " << xLoc << "," << yLoc
            << " @ 0x" << std::hex << loc
            << std::dec << " type: " << encounterType << " index: " << encounterIndex
            << " saveAddr: 0x" << std::hex << saveAddr << std::dec << std::endl;

        encounters.emplace_back(
            encounterType,
            encounterIndex,
            glm::vec<2, int>{xLoc, yLoc},
            tile,
            saveAddr);
    }

    return encounters;
}

}
