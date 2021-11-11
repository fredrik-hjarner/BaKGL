#pragma once

#include "bak/inventoryItem.hpp"
#include "bak/skills.hpp"

#include <optional>
#include <ostream>


namespace BAK {

struct LockStats
{
    unsigned mLockFlag;
    unsigned mRating;
    unsigned mFairyChestIndex;
    unsigned mTrapDamage;
};

std::ostream& operator<<(std::ostream&, const LockStats&);

// This is the lock "image" type
enum class LockType
{
    Easy,
    Medium,
    Hard,
    Unpickable
};

std::string_view ToString(LockType);

LockType ClassifyLock(unsigned lockRating);

std::optional<unsigned> GetLockIndex(unsigned lockRating);
ItemIndex GetCorrespondingKey(unsigned lockIndex);
unsigned DescribeLock(unsigned picklockSkill, unsigned lockRating);

bool TryOpenLockWithKey(const BAK::InventoryItem&, unsigned lockRating); 
bool WouldKeyBreak(const BAK::InventoryItem&, unsigned lockRating);
bool KeyBroken(const InventoryItem& item, const Skill& skill, unsigned lockRating);

bool PicklockBroken(const Skill& skill, unsigned lockRating);
bool PicklockSkillImproved();
bool CanPickLock(const Skill& skill, unsigned lockRating);

}
