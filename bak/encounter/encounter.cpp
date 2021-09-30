#include "bak/encounter/encounter.hpp"

#include "com/logger.hpp"

#include "graphics/glm.hpp"
#include <glm/glm.hpp>

#include <iostream>
#include <string_view>
#include <vector>

namespace BAK::Encounter {

std::string_view ToString(EncounterType t)
{
    switch (t)
    {
    case EncounterType::Background: return "background";
    case EncounterType::Combat: return "combat";
    case EncounterType::Comment: return "comment";
    case EncounterType::Dialog: return "dialog";
    case EncounterType::Health: return "health";
    case EncounterType::Sound: return "sound";
    case EncounterType::Town: return "town";
    case EncounterType::Trap: return "trap";
    case EncounterType::Zone: return "zone";
    case EncounterType::Disable: return "disable";
    case EncounterType::Enable: return "enable";
    case EncounterType::Block: return "block";
    default: return "unknown";
    }
}

std::string_view ToString(const EncounterT& encounter)
{
    return std::visit(
        overloaded{
            [](const GDSEntry&){ return "GDSEntry"; },
            [](const Block&){ return "Block"; },
            [](const Combat&){ return "Combat"; },
            [](const Dialog&){ return "Dialog"; },
            [](const EventFlag&){ return "EventFlag"; },
            [](const Zone&){ return "Zone"; }
        },
        encounter);
}
 
std::ostream& operator<<(std::ostream& os, EncounterType e)
{
    return os << ToString(e);
}

std::ostream& operator<<(std::ostream& os, const EncounterT& encounter)
{
    std::visit([&os](const auto& e){ os << e; }, encounter);
    return os;
}

std::ostream& operator<<(std::ostream& os, const Encounter& e)
{
    os << "{" << e.mEncounter << "} dims: " << e.mDimensions
        << " tile: " << e.mTile 
        << std::hex << " savePtr: ("
        << e.mSaveAddress << ", " << e.mSaveAddress2 << ", "
        << e.mSaveAddress3
        << ") Unknown [" << +e.mUnknown0 << ","
        << +e.mUnknown1 << "," << +e.mUnknown2 << "]" << std::dec;
    return os;
}

std::pair<
    glm::vec<2, unsigned>,
    glm::vec<2, unsigned>>
CalculateLocationAndDims(
    glm::vec<2, unsigned> tile,
    std::uint8_t l,
    std::uint8_t t,
    std::uint8_t r,
    std::uint8_t b)
{
    // Reminder - BAK coordinates origin is at bottom left
    // and x and y grow positive
    const auto topLeft = MakeGamePositionFromTileAndOffset(
        tile, glm::vec<2, std::uint8_t>{l, t});
    const auto bottomRight = MakeGamePositionFromTileAndOffset(
        tile, glm::vec<2, std::uint8_t>{r, b});
    // Give them some thickness
    const auto left = topLeft.x;
    const auto top = topLeft.y;
    const auto right = bottomRight.x;
    const auto bottom = bottomRight.y;
    const auto width = right == left
        ? gOffsetScale
        : right - left;
    const auto height = top == bottom
        ? gOffsetScale
        : top - bottom;

    const auto location = GamePosition{
        left + width / 2,
        bottom + height / 2};
    const auto dimensions = glm::vec<2, unsigned>{
        width, height};

    return std::make_pair(location, dimensions);
}


std::vector<Encounter> LoadEncounters(
    const EncounterFactory& ef,
    FileBuffer& fb,
    unsigned chapter,
    glm::vec<2, unsigned> tile)
{
    const auto& logger = Logging::LogState::GetLogger("LoadEncounter");
    std::vector<Encounter> encounters{};
    // Ideally load all encounters... each chapter can be part of the
    // encounter type and they can be filtered later
    fb.Seek((chapter - 1) * 192);
    unsigned numberOfEncounters = fb.GetUint16LE();

    encounters.reserve(numberOfEncounters);
    
    for (unsigned i = 0; i < numberOfEncounters; i++)
    {
        auto loc = fb.Tell();
        auto encounterType = static_cast<EncounterType>(fb.GetUint16LE());
        
        const unsigned left   = fb.GetUint8();
        const unsigned top    = fb.GetUint8();
        const unsigned right  = fb.GetUint8();
        const unsigned bottom = fb.GetUint8();

        const auto& [location, dimensions] = CalculateLocationAndDims(
            tile,
            left,
            top,
            right,
            bottom);

        const unsigned encounterIndex = fb.GetUint16LE();
        // Don't know
        const auto unknown0 = fb.GetUint8();
        const auto unknown1 = fb.GetUint16LE();
        const auto saveAddr = fb.GetUint16LE();
        const unsigned saveAddr2 = fb.GetUint16LE();
        const unsigned saveAddr3 = fb.GetUint16LE();
        const auto unknown2 = fb.GetUint16LE();

        logger.Debug() << "Loaded encounter: " << tile << " loc: " << location
            << " dims: " << dimensions << " @ 0x" << std::hex << loc
            << std::dec << " type: " << encounterType << " index: " << encounterIndex
            << " saveAddr: 0x" << std::hex << saveAddr << ", " << saveAddr2 << ", "
            << saveAddr3 << std::dec << "\n";

        encounters.emplace_back(
            ef.MakeEncounter(
                encounterType,
                encounterIndex,
                tile),
            location,
            dimensions,
            tile,
            saveAddr,
            saveAddr2,
            saveAddr3,
            unknown0,
            unknown1,
            unknown2);
    }

    return encounters;
}

EncounterT EncounterFactory::MakeEncounter(
    EncounterType eType,
    EncounterIndex eIndex,
    glm::vec<2, unsigned> tile) const
{
    switch (eType)
    {
    case EncounterType::Background:
        return mBackgrounds.Get(eIndex, tile);
    case EncounterType::Combat:
        {
            auto combat = mCombats.Get(eIndex);
            combat.mNorthRetreat.mPosition += (tile * static_cast<unsigned>(64000));
            combat.mSouthRetreat.mPosition += (tile * static_cast<unsigned>(64000));
            combat.mWestRetreat.mPosition += (tile * static_cast<unsigned>(64000));
            combat.mEastRetreat.mPosition += (tile * static_cast<unsigned>(64000));
            return combat;
        }
    case EncounterType::Comment:
        throw std::runtime_error("Can't make COMMENT encounters");
    case EncounterType::Dialog:
        return mDialogs.Get(eIndex);
    case EncounterType::Health:
        throw std::runtime_error("Can't make HEALTH encounters");
    case EncounterType::Sound:
        throw std::runtime_error("Can't make SOUND encounters");
    case EncounterType::Town:
        return mTowns.Get(eIndex, tile);
    case EncounterType::Trap:
        return mTraps.Get(eIndex);
    case EncounterType::Zone:
        return mZones.Get(eIndex);
    case EncounterType::Disable:
        return mDisables.Get(eIndex);
    case EncounterType::Enable:
        return mEnables.Get(eIndex);
    case EncounterType::Block:
        return mBlocks.Get(eIndex);
    default:
        throw std::runtime_error("Can't make UNKNOWN encounters");
    }
}

}