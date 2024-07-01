#include "bak/encounter/encounter.hpp"

#include "com/logger.hpp"
#include "com/visit.hpp"

#include "graphics/glm.hpp"

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
    os << "Encounter { index: " << e.mIndex
        << " dims: " << e.mDimensions
        << " worldLocation: " << e.mLocation
        << " TL: " << e.mTopLeft
        << " BR: " << e.mBottomRight
        << " tile: " << e.mTile 
        << std::hex << " savePtr: ("
        << e.mSaveAddress << ", " << e.mSaveAddress2 << ", "
        << e.mSaveAddress3
        << ") Unknown [" << +e.mUnknown0 << ","
        << +e.mUnknown1 << "," << +e.mUnknown2 << "," 
        << +e.mUnknown3 << "]" << std::dec
        << "{" << e.mEncounter << "}}";
    return os;
}

std::pair<
    glm::uvec2,
    glm::uvec2>
CalculateLocationAndDims(
    glm::uvec2 tile,
    std::uint8_t l,
    std::uint8_t t,
    std::uint8_t r,
    std::uint8_t b)
{
    // Reminder - BAK coordinates origin is at bottom left
    // and x and y grow positive
    const auto topLeft = MakeGamePositionFromTileAndCell(
        tile, glm::vec<2, std::uint8_t>{l, t});
    const auto bottomRight = MakeGamePositionFromTileAndCell(
        tile, glm::vec<2, std::uint8_t>{r, b});
    // Give them some thickness
    const auto left = topLeft.x;
    const auto top = topLeft.y;
    const auto right = bottomRight.x;
    const auto bottom = bottomRight.y;
    ASSERT(right >= left && top >= bottom);
    const auto width = right == left
        ? gCellSize
        : right - left;
    const auto height = top == bottom
        ? gCellSize
        : top - bottom;

    // This is just not quite right... 
    // not sure if I am rendering items at the wrong place 
    // or if this is incorrect. According to the assembly
    // this 800 offset shouldn't be required...
    const auto xOffset = gCellSize / 2;
    const auto yOffset = xOffset;
    const auto location = GamePosition{
        left + (width / 2) - xOffset, 
        bottom + (height / 2) - yOffset};
    const auto dimensions = glm::uvec2{
        width, height};

    return std::make_pair(location, dimensions);
}


std::vector<Encounter> LoadEncounters(
    const EncounterFactory& ef,
    FileBuffer& fb,
    Chapter chapter,
    glm::uvec2 tile,
    unsigned tileIndex)
{
    const auto& logger = Logging::LogState::GetLogger("LoadEncounter");
    std::vector<Encounter> encounters{};
    // Ideally load all encounters... each chapter can be part of the
    // encounter type and they can be filtered later
    constexpr auto encounterEntrySize = 0x13;
    constexpr auto maxEncounters = 0xa;
    // + 2 for the count of encounters
    fb.Seek((chapter.mValue - 1) * (encounterEntrySize * maxEncounters + 2));
    unsigned numberOfEncounters = fb.GetUint16LE();

    encounters.reserve(numberOfEncounters);
    
    logger.Debug() << "Loading encounters for chapter: " << chapter.mValue << " encounters: " << numberOfEncounters << "\n";
    for (unsigned i = 0; i < numberOfEncounters; i++)
    {
        auto loc = fb.Tell();
        auto encounterType = static_cast<EncounterType>(fb.GetUint16LE());
        
        const unsigned left   = fb.GetUint8();
        const unsigned top    = fb.GetUint8();
        const unsigned right  = fb.GetUint8();
        const unsigned bottom = fb.GetUint8();
        const auto topLeft = glm::uvec2{left, top};
        const auto bottomRight = glm::uvec2{right, bottom};

        const auto& [location, dimensions] = CalculateLocationAndDims(
            tile,
            left,
            top,
            right,
            bottom);

        const unsigned encounterTableIndex = fb.GetUint16LE();
        // Don't know
        const auto unknown0 = fb.GetUint8();
        const auto unknown1 = fb.GetUint8();
        const auto unknown2 = fb.GetUint8();
        const auto saveAddr = fb.GetUint16LE();
        const unsigned saveAddr2 = fb.GetUint16LE();
        const unsigned saveAddr3 = fb.GetUint16LE();
        const auto unknown3 = fb.GetUint16LE();

        logger.Debug() << "Loaded encounter: " << tile << " loc: " << location
            << " dims: " << dimensions << " @ 0x" << std::hex << loc
            << std::dec << " type: " << encounterType << " index: " << encounterTableIndex
            << " saveAddr: 0x" << std::hex << saveAddr << ", " << saveAddr2 << ", "
            << saveAddr3 << std::dec << "\n";
        encounters.emplace_back(
            ef.MakeEncounter(
                encounterType,
                encounterTableIndex,
                tile),
            EncounterIndex{i},
            topLeft,
            bottomRight,
            location,
            dimensions,
            tile,
            tileIndex,
            saveAddr,
            saveAddr2,
            saveAddr3,
            unknown0,
            unknown1,
            unknown2,
            unknown3);
    }

    return encounters;
}

EncounterT EncounterFactory::MakeEncounter(
    EncounterType eType,
    unsigned encounterIndex,
    glm::uvec2 tile) const
{
    switch (eType)
    {
    case EncounterType::Background:
        return mBackgrounds.Get(encounterIndex, tile);
    case EncounterType::Combat:
        {
            auto combat = mCombats.Get(encounterIndex);
            const auto tilePos = tile * static_cast<unsigned>(64000);
            combat.mNorthRetreat.mPosition += tilePos;
            combat.mSouthRetreat.mPosition += tilePos;
            combat.mWestRetreat.mPosition += tilePos;
            combat.mEastRetreat.mPosition += tilePos;
            for (auto& combatant : combat.mCombatants)
            {
                combatant.mLocation.mPosition += tilePos;
            }
            return combat;
        }
    case EncounterType::Comment:
        throw std::runtime_error("Can't make COMMENT encounters");
    case EncounterType::Dialog:
        return mDialogs.Get(encounterIndex);
    case EncounterType::Health:
        throw std::runtime_error("Can't make HEALTH encounters");
    case EncounterType::Sound:
        throw std::runtime_error("Can't make SOUND encounters");
    case EncounterType::Town:
        return mTowns.Get(encounterIndex, tile);
    case EncounterType::Trap:
        {
            auto combat = mTraps.Get(encounterIndex);
            const auto tilePos = tile * static_cast<unsigned>(64000);
            combat.mNorthRetreat.mPosition += tilePos;
            combat.mSouthRetreat.mPosition += tilePos;
            combat.mWestRetreat.mPosition += tilePos;
            combat.mEastRetreat.mPosition += tilePos;
            for (auto& combatant : combat.mCombatants)
            {
                combatant.mLocation.mPosition += tilePos;
            }
            return combat;
        }
    case EncounterType::Zone:
        return mZones.Get(encounterIndex);
    case EncounterType::Disable:
        return mDisables.Get(encounterIndex);
    case EncounterType::Enable:
        return mEnables.Get(encounterIndex);
    case EncounterType::Block:
        return mBlocks.Get(encounterIndex);
    default:
        throw std::runtime_error("Can't make UNKNOWN encounters");
    }
}

EncounterStore::EncounterStore(
    const EncounterFactory& ef,
    FileBuffer& fb,
    glm::uvec2 tile,
    unsigned tileIndex)
:
    mChapters{}
{
    mChapters.reserve(10);
    for (unsigned chapter = 1; chapter < 11; chapter++)
    {
        mChapters.emplace_back(
            LoadEncounters(
                ef,
                fb,
                Chapter{chapter},
                tile,
                tileIndex));
    }
}

const std::vector<Encounter>& EncounterStore::GetEncounters(Chapter chapter) const
{
    assert(chapter.mValue > 0 && chapter.mValue < 11);
    return mChapters[chapter.mValue - 1];
}

}
