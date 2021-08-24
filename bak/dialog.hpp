#pragma once

#include "bak/constants.hpp"
#include "bak/dialogTarget.hpp"
#include "bak/resourceNames.hpp"

#include "com/logger.hpp"
#include "com/ostream.hpp"

#include "xbak/Exception.h"
#include "xbak/FileBuffer.h"

#include <cassert>
#include <iomanip>
#include <ostream>
#include <unordered_map>

namespace BAK {

class Keywords
{
public:
    void Load(FileBuffer& fb);
};

enum class ChoiceState
{
    Money   = 0x7531,
    Chapter = 0x7537,
    Time    = 0x7539,

};

enum class DisplayFlags
{
    Fullscreen = 0x6,
};

enum class DialogResult
{
    // Maybe also something to do wih tstate?
    Unknown1  = 0x01,
    GiveItem  = 0x02,
    LoseItem  = 0x03, // pt2 object, pt3 amount
    // Unlocks dialog options / Sets event state
    SetFlag   = 0x04,
    GainSkill = 0x09,
    // Maybe?
    PlaySound = 0xc,
    // something to with state?
    Unknown = 0x10,
};

struct DialogChoice
{
    DialogChoice(
        std::uint16_t state,
        std::uint16_t choice1,
        std::uint16_t choice2,
        Target target)
    :
        mState{state},
        mChoice1{choice1},
        mChoice2{choice2},
        mTarget{target}
    {}

    std::uint16_t mState;
    std::uint16_t mChoice1;
    std::uint16_t mChoice2;
    Target mTarget;
};

struct DialogAction
{
    DialogAction(
        //std::uint16_t first,
        //std::uint16_t result,
        const std::array<std::uint8_t, 10>& rest)
    :
        //mFirst{first},
        //mResult{static_cast<DialogResult>(result)},
        mRest{rest}
    {}

    //std::uint16_t mFirst;
    //DialogResult mResult;
    std::array<std::uint8_t, 10> mRest;
};

std::ostream& operator<<(std::ostream& os, const DialogAction& d);

class DialogSnippet
{
public:
    DialogSnippet(FileBuffer& fb, std::uint8_t dialogFile);

    const auto& GetChoices() const { return mChoices; }
    std::string_view GetText() const { return mText; }

    std::uint8_t mDisplayStyle;
    std::uint16_t mActor;
    std::uint8_t mDisplayStyle2;
    std::uint8_t mDisplayStyle3;

    std::vector<DialogChoice> mChoices;
    std::vector<DialogAction> mActions;
    std::string mText;
};

std::ostream& operator<<(std::ostream& os, const DialogSnippet& d);

class DialogStore
{
public:
    DialogStore();

    void ShowAllDialogs();
    void ShowDialog(Target dialogKey);

    const DialogSnippet& GetSnippet(Target target) const;

    bool HasSnippet(Target target) const;

    OffsetTarget GetTarget(KeyTarget dialogKey);

    std::string_view GetFirstText(const DialogSnippet& snippet) const;

    const DialogSnippet& operator()(KeyTarget dialogKey) const;
    const DialogSnippet& operator()(OffsetTarget snippetKey) const;

private:
    void Load();

    std::string GetDialogFile(std::uint8_t i);

    std::unordered_map<
        KeyTarget,
        OffsetTarget> mDialogMap;

    std::unordered_map<
        OffsetTarget,
        DialogSnippet> mSnippetMap;

    const Logging::Logger& mLogger;
};

class DialogIndex
{
public:
    DialogIndex();

    const auto& GetKeys() const { return mKeys; }

private:
    void Load();


    std::vector<Target> mKeys;

    const Logging::Logger& mLogger;
};

}
