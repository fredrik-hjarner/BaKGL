#pragma once

#include "bak/dialog.hpp"
#include "bak/dialogAction.hpp"
#include "bak/gameData.hpp"
#include "bak/types.hpp"

namespace BAK {

class GameState
{
public:
    GameState()
    :
        GameState{nullptr}
    {}

    GameState(
        GameData* gameData)
    :
        mPartyLeader{
            "Locklear",
            1},
        mPartyFollower{
            "Owyn",
            2},
        mGameData{gameData}
    {}

    struct Character
    {
        std::string mName;
        unsigned mIndex;
    };

    Chapter GetChapter() const
    {
        return 1;
    }

    auto GetMoney() const
    {
        if (mGameData)
            return mGameData->mParty.mGold;

        return 1000;
    }

    auto GetTime() const
    {
        if (mGameData)
        {
            const auto hour = mGameData->mTime.mTime.GetHour();
            return static_cast<int>(hour > 18);
        }
        else
        {
            return 0; // daytime
            //return 1; // nighttime
        }
    }

    auto GetShopType() const
    {
        return 4;
    }

    const Character& GetPartyLeader()
    {
        return mPartyLeader;
    }

    // Return random person who's not the leader...
    const Character& GetPartyFollower()
    {
        return mPartyFollower;
    }

    bool GetComplexEventState(unsigned eventPtr) const
    {
        if (mEventState.contains(eventPtr))
            return mEventState.at(eventPtr);
        else if (mGameData != nullptr)
            return mGameData->ReadComplexEvent(eventPtr);
        else
            return false;
    }

    bool GetEventState(unsigned eventPtr) const
    {
        if (mEventState.contains(eventPtr))
            return mEventState.at(eventPtr);
        else if (mGameData != nullptr)
            return mGameData->ReadEvent(eventPtr);
        else
            return false;
    }

    void SetEventState(const SetFlag& setFlag)
    {
        if ((setFlag.mEventPointer & 0xd000) == 0xd000)
        {
            SetComplexEvent(setFlag);
        }
        else
        {
            mEventState.emplace(setFlag.mEventPointer, true);
        }
    }

    void SetComplexEvent(const SetFlag& setFlag)
    {
        const auto data = GetEventState(setFlag.mEventPointer);
        const auto result = (data & setFlag.mEventMask) 
            | setFlag.mEventData;
        mEventState.emplace(setFlag.mEventPointer, result);
    }

    Character mPartyLeader;
    Character mPartyFollower;
    GameData* mGameData;
    std::unordered_map<unsigned, bool> mEventState;
};

}
