#pragma once

#include "bak/dialogSources.hpp"
#include "bak/inventory.hpp"
#include "bak/layout.hpp"
#include "bak/textureFactory.hpp"

#include "gui/IDialogScene.hpp"
#include "gui/IGuiManager.hpp"
#include "gui/backgrounds.hpp"
#include "gui/icons.hpp"
#include "gui/colors.hpp"
#include "gui/clickButton.hpp"
#include "gui/textBox.hpp"
#include "gui/widget.hpp"

#include <glm/glm.hpp>

#include <algorithm>
#include <iostream>
#include <utility>
#include <variant>

namespace Gui {

class InventorySlot;

class IDragTarget
{
public:
    virtual bool WidgetDropped(InventorySlot&, const glm::vec2& pos) = 0;
};

class InventorySlot :
    public Widget,
    public IDragTarget
{
public:
    InventorySlot(
        glm::vec2 pos,
        glm::vec2 dims,
        const Font& font,
        const Icons& icons,
        IDragTarget& dragTarget,
        unsigned itemIndex,
        const BAK::InventoryItem& item,
        std::function<void()>&& showItemDescription)
    :
        Widget{
            RectTag{},
            pos,
            dims,
            glm::vec4{},
            true
        },
        mDragTarget{dragTarget},
        mItemIndex{itemIndex},
        mItemRef{item},
        mShowItemDescription{std::move(showItemDescription)},
        mIsSelected{false},
        mOriginalPosition{pos},
        mDragStart{},
        mDragging{false},
        mQuantity{
            glm::vec2{0, 0},
            glm::vec2{40, 30}
        },
        mItem{
            ImageTag{},

            std::get<Graphics::SpriteSheetIndex>(
                icons.GetInventoryIcon(item.GetObject().mImageIndex)),
            std::get<Graphics::TextureIndex>(
                icons.GetInventoryIcon(item.GetObject().mImageIndex)),
            pos,
            std::get<glm::vec2>(
                icons.GetInventoryIcon(item.GetObject().mImageIndex)),
            true
        }
    {
        assert(mShowItemDescription);
        mItem.SetCenter(GetCenter() - GetTopLeft());

        UpdateQuantity(font, item);

        AddChildren();
    }

    unsigned GetItemIndex() const
    {
        return mItemIndex;
    }

    const BAK::InventoryItem& GetItem() const
    {
        return mItemRef;
    }

    bool OnMouseEvent(const MouseEvent& event) override
    {
        const auto result = std::visit(overloaded{
            [this](const LeftMousePress& p){ return LeftMousePressed(p.mValue); },
            [this](const LeftMouseRelease& p){ return LeftMouseReleased(p.mValue); },
            [this](const MouseMove& p){ return MouseMoved(p.mValue); },
            [this](const RightMousePress& p){ return RightMousePressed(p.mValue); },
            [](const auto& p){ return false; }
            },
            event);

        UpdateSelected();

        return result;
    }

    bool LeftMousePressed(glm::vec2 click)
    {
        if (Within(click))
        {

            Logging::LogDebug("Item") << __FUNCTION__ << " " << click <<
                " " << mDragStart << " drg: " << mDragging << " " << mOriginalPosition << "\n";
            mIsSelected = true;
            Logging::LogDebug("InventoryItem") << "Clicked: " << mItemRef << "\n"
                << mItemRef.GetObject() << "\n";
            mDragStart = click;
        }
        else
        {
            mIsSelected = false;
        }

        return false;
    }

    bool MouseMoved(glm::vec2 pos)
    {
        if (mDragStart && glm::distance(*mDragStart, pos) > 4)
        {
            mDragging = true;
            mIsSelected = false;
        }

        if (mDragging)
        {
            Logging::LogDebug("Item") << __FUNCTION__ << " " << pos <<
            " " << mDragStart << " drg: " << mDragging << " " << mOriginalPosition << "\n";
            SetCenter(pos);
        }
        
        return false;
    }

    bool LeftMouseReleased(glm::vec2 click)
    {
        Logging::LogDebug("Item") << __FUNCTION__ << " " << click <<
                " " << mDragStart << " drg: " << mDragging << " " << mOriginalPosition << "\n";

        mDragStart.reset();

        if (mDragging)
        {
            mDragging = false;
            SetPosition(mOriginalPosition);
            if (mDragTarget.WidgetDropped(*this, click))
                return true;
        }

        return false;
    }

    bool RightMousePressed(glm::vec2 click)
    {
        if (mDragging)
            return false;

        if (Within(click))
        {
            mIsSelected = true;
            mShowItemDescription();
        }
        else
            mIsSelected = false;

        return false;
    }

    bool WidgetDropped(InventorySlot& item, const glm::vec2& pos) override
    {
        if (Within(pos))
        {
            Logging::LogDebug("InventorySlot") << __FUNCTION__
                << " " << pos << " item : " << item 
                << " this: " << (*this) << "\n";
            return true;
        }

        return false;
    }

    void UpdateSelected()
    {
        if (mIsSelected)
            SetColor(Color::itemHighlighted);
        else
            SetColor(glm::vec4{});
    }

    void UpdateQuantity(
        const Font& font,
        const BAK::InventoryItem& item)
    {
        std::stringstream ss{};
        ss << "#" << +item.mCondition << 
            (item.IsStackable() ? "" : "%");
        const auto& [textDims, _] = mQuantity.AddText(font, ss.str());
        const auto& dims = GetPositionInfo().mDimensions;
        mQuantity.SetPosition(
            dims - textDims 
            + glm::vec2{4, 2});
    }

private:
    void AddChildren()
    {
        ClearChildren();
        AddChildBack(&mItem);
        AddChildBack(&mQuantity);
    }
    
    IDragTarget& mDragTarget;
    const unsigned mItemIndex;
    const BAK::InventoryItem& mItemRef;
    std::function<void()> mShowItemDescription;
    bool mIsSelected;

    glm::vec2 mOriginalPosition;
    std::optional<glm::vec2> mDragStart;
    bool mDragging;

    TextBox mQuantity;
    Widget mItem;
};

class EquipmentSlot : public Widget
{
public:
    EquipmentSlot(
        glm::vec2 pos,
        glm::vec2 dims,
        const Icons& mIcons,
        unsigned icon)
    :
        Widget{
            RectTag{},
            pos,
            dims,
            glm::vec4{},
            true
        },
        mBlank{
            ImageTag{},
            std::get<Graphics::SpriteSheetIndex>(
                mIcons.GetInventoryIcon(icon)),
            std::get<Graphics::TextureIndex>(
                mIcons.GetInventoryIcon(icon)),
            glm::vec2{0},
            dims,
            true
        }
    {
        ClearItem();
    }

    template <typename ...Args>
    void AddItem(Args&&... args)
    {
        ClearChildren();
        mItem.emplace(std::forward<Args>(args)...);
        AddChildBack(&(*mItem));
    }

    void ClearItem()
    {
        ClearChildren();
        AddChildBack(&mBlank);
    }

private:
    std::optional<InventorySlot> mItem;
    Widget mBlank;
};

class CharacterPortrait : 
    public ClickButtonImage,
    public IDragTarget
{
public:
    // Transfer item between inventory slot and this character
    using TransferItemFunction = std::function<void(InventorySlot&)>;

    template <typename ...Args>
    CharacterPortrait(
        TransferItemFunction&& transferItem,
        Args&&... args)
    :
        ClickButtonImage{std::forward<Args>(args)...},
        mTransferItem{std::move(transferItem)}
    {}

    bool WidgetDropped(InventorySlot& slot, const glm::vec2& pos) override
    {
        if (Within(pos))
        {
            mTransferItem(slot);
            return true;
        }
        return false;
    }

private:
    TransferItemFunction mTransferItem;
};

class InventoryScreen :
    public Widget,
    public IDragTarget
{
public:
    static constexpr auto sLayoutFile = "REQ_INV.DAT";
    static constexpr auto sBackground = "INVENTOR.SCX";

    // Request offsets
    static constexpr auto mContainerTypeRequest = 3;
    static constexpr auto mUseItemRequest = 4;
    static constexpr auto mExitRequest = 5;
    static constexpr auto mExitButton = 13;
    static constexpr auto mGoldRequest = 6;

    InventoryScreen(
        IGuiManager& guiManager,
        const Backgrounds& backgrounds,
        const Icons& icons,
        const Font& font,
        BAK::GameState& gameState)
    :
        // Black background
        Widget{
            RectTag{},
            glm::vec2{0},
            glm::vec2{320, 200},
            Color::black,
            true
        },
        mGuiManager{guiManager},
        mFont{font},
        mIcons{icons},
        mGameState{gameState},
        mDialogScene{},
        mLayout{sLayoutFile},
        mFrame{
            ImageTag{},
            backgrounds.GetSpriteSheet(),
            backgrounds.GetScreen(sBackground),
            GetPositionInfo().mPosition,
            GetPositionInfo().mDimensions,
            true
        },
        mCharacters{},
        mExit{
            mLayout.GetWidgetLocation(mExitRequest),
            mLayout.GetWidgetDimensions(mExitRequest),
            std::get<Graphics::SpriteSheetIndex>(mIcons.GetButton(mExitButton)),
            std::get<Graphics::TextureIndex>(mIcons.GetButton(mExitButton)),
            std::get<Graphics::TextureIndex>(mIcons.GetPressedButton(mExitButton)),
            [this]{ mGuiManager.ExitInventory(); },
            []{}
        },
        mGoldDisplay{
            mLayout.GetWidgetLocation(mGoldRequest),
            mLayout.GetWidgetDimensions(mGoldRequest),
        },
        mContainerTypeDisplay{
            mLayout.GetWidgetLocation(mContainerTypeRequest),
            mLayout.GetWidgetDimensions(mContainerTypeRequest),
            std::get<Graphics::SpriteSheetIndex>(mIcons.GetInventoryMiscIcon(11)),
            std::get<Graphics::TextureIndex>(mIcons.GetInventoryMiscIcon(11)),
            std::get<Graphics::TextureIndex>(mIcons.GetInventoryMiscIcon(11)),
            []{}, // Goto Keys, or goto Shop, or Goto Bag, or Goto Container...
            []{}
        },
        mWeapon{
            glm::vec2{13, 15},
            glm::vec2{80, 29},
            mIcons,
            130
        },
        mCrossbow{
            glm::vec2{13, 15 + 29},
            glm::vec2{80, 29},
            mIcons,
            130
        },
        mArmor{
            glm::vec2{13, 15 + 29 * 2},
            glm::vec2{80, 58},
            mIcons,
            131
        },
        mInventoryItems{},
        mSelectedCharacter{0},
        mLogger{Logging::LogState::GetLogger("Gui::InventoryScreen")}
    {
        mCharacters.reserve(4);
        AddChildren();
    }

    void SetSelectedCharacter(unsigned character)
    {
        mSelectedCharacter = character;
        UpdatePartyMembers();
        UpdateGold();
        UpdateInventoryContents();

        AddChildren();
    }

    bool WidgetDropped(InventorySlot& item, const glm::vec2& pos) override
    {
        for (auto* slot : mDragTargets)
        {
            ASSERT(slot);
            if (slot->WidgetDropped(item, pos))
            {
                // force refresh of inventory display
                SetSelectedCharacter(mSelectedCharacter);
                return true;
            }
        }
        return false;
    }

private:
    void TransferItem(InventorySlot& slot, unsigned character)
    {
        if (character != mSelectedCharacter)
        {
            // FIXME: Check if full
            auto item = slot.GetItem();
            mGameState.GetParty()
                .GetActiveCharacter(character)
                .GiveItem(item);
            mGameState.GetParty()
                .GetActiveCharacter(mSelectedCharacter)
                .GetInventory()
                .RemoveItem(slot.GetItemIndex());
        }
    }

    void ShowItemDescription(const BAK::InventoryItem& item)
    {
        mGameState.SetDialogContext(item.mItemIndex.mValue);
        mGuiManager.StartDialog(
            BAK::DialogSources::GetItemDescription(),
            false,
            &mDialogScene);
    }

    void UpdatePartyMembers()
    {
        mCharacters.clear();

        const auto& party = mGameState.GetParty();
        for (unsigned person = 0; person < party.mActiveCharacters.size(); person++)
        {
            const auto [spriteSheet, image, _] = mIcons.GetCharacterHead(party.mActiveCharacters[person]);
            mCharacters.emplace_back(
                [this, character=person](InventorySlot& slot){
                    TransferItem(slot, character);
                },
                mLayout.GetWidgetLocation(person),
                mLayout.GetWidgetDimensions(person),
                spriteSheet,
                image,
                image,
                [this, character=person]{
                    // Switch character
                    SetSelectedCharacter(character);
                },
                [this, character=person]{
                    mGuiManager.ShowCharacterPortrait(character);
                }
            );
        }
    }

    void UpdateGold()
    {
        const auto gold = mGameState.GetParty().GetGold();
        const auto sovereigns = BAK::GetSovereigns(gold);
        const auto royals = BAK::GetRemainingRoyals(gold);
        std::stringstream ss{};
        ss << "#" << sovereigns << "s " << royals << "r";
        const auto [textDims, _] = mGoldDisplay.AddText(mFont, ss.str());

        // Justify text to the right
        const auto basePos = mLayout.GetWidgetLocation(mGoldRequest);
        const auto newPos = basePos 
            + glm::vec2{
                3 + mLayout.GetWidgetDimensions(mGoldRequest).x - textDims.x,
                4};

        mGoldDisplay.SetPosition(newPos);
    }

    void SetContainerTypeImage()
    {
        const auto [ss, ti, dims] = mIcons.GetInventoryMiscIcon(11);
        mContainerTypeDisplay.CenterImage(dims);
    }

    void UpdateInventoryContents()
    {
        mInventoryItems.clear();

        const auto& character = mGameState.GetParty().GetActiveCharacter(mSelectedCharacter);
        mLogger.Info() << "Updating Character: " << character << "\n";
        const auto& inventory = character.GetInventory();

        std::vector<const BAK::InventoryItem*> items{};

        const auto numItems = inventory.GetItems().size();
        mInventoryItems.reserve(numItems);
        items.reserve(numItems);

        std::transform(
            inventory.GetItems().begin(), inventory.GetItems().end(),
            std::back_inserter(items),
            [](const auto& i) -> const BAK::InventoryItem* {
                return &i;
            });

        std::sort(items.begin(), items.end(), [](const auto& l, const auto& r) 
        {
            return l->GetObject().mImageSize > r->GetObject().mImageSize;
        });

        unsigned majorColumn = 0;
        unsigned minorColumn = 0;
        unsigned majorRow = 0;
        unsigned minorRow = 0;

        auto pos  = glm::vec2{105, 11};
        const auto slotDims = glm::vec2{40, 29};

        mCrossbow.ClearItem();
        mArmor.ClearItem();

        for (unsigned itemIndex = 0; itemIndex < items.size(); itemIndex++)
        {
            ASSERT(items[itemIndex]);
            const auto& item = *items[itemIndex];
            const auto& [ss, ti, _] = mIcons.GetInventoryIcon(item.mItemIndex.mValue);
            const auto itemPos = pos + glm::vec2{
                    (majorColumn * 2 + minorColumn) * slotDims.x,
                    (majorRow * 2 + minorRow) * slotDims.y};

            auto dims = slotDims;

            if ((item.GetObject().mType == BAK::ItemType::Sword
                || item.GetObject().mType == BAK::ItemType::Staff)
                && item.IsEquipped())
            {
                auto scale = slotDims * glm::vec2{2, 1};
                if (item.GetObject().mType == BAK::ItemType::Staff)
                {
                    scale = scale * glm::vec2{1, 2};
                    mWeapon.SetDimensions({80, 58});
                }
                else
                {
                    mWeapon.SetDimensions({80, 29});
                }

                mWeapon.AddItem(
                    glm::vec2{0},
                    scale,
                    mFont,
                    mIcons,
                    *this,
                    itemIndex,
                    item,
                    [&]{
                        ShowItemDescription(item);
                    });

                continue;
            }
            if (item.GetObject().mType == BAK::ItemType::Crossbow
                && item.IsEquipped())
            {
                mCrossbow.AddItem(
                    glm::vec2{0},
                    slotDims * glm::vec2{2, 1},
                    mFont,
                    mIcons,
                    *this,
                    itemIndex,
                    item,
                    [&]{
                        ShowItemDescription(item);
                    });

                continue;
            }

            if (item.GetObject().mType == BAK::ItemType::Armor
                && item.IsEquipped())
            {
                mArmor.AddItem(
                    glm::vec2{0},
                    slotDims * glm::vec2{2},
                    mFont,
                    mIcons,
                    *this,
                    itemIndex,
                    item,
                    [&]{
                        ShowItemDescription(item);
                    });

                continue;
            }

            mLogger.Debug() << "Item: " << item 
                << " mc: " << minorColumn << " MC: " << majorColumn 
                << " mr: " << minorRow << " MR: " << majorRow << "\n";
            if (item.GetObject().mImageSize == 1)
            {
                minorColumn += 1;
            }
            else if (item.GetObject().mImageSize == 2)
            {
                minorRow += 1;
                dims.x *= 2;
            }
            else if (item.GetObject().mImageSize == 4)
            {
                dims.x *= 2;
                dims.y *= 2;
                majorRow += 1;
            }

            mLogger.Debug() << "AfterPlace: " << item 
                << " mc: " << minorColumn << " MC: " << majorColumn 
                << " mr: " << minorRow << " MR: " << majorRow << "\n";
            mInventoryItems.emplace_back(
                itemPos,
                dims,
                mFont,
                mIcons,
                *this,
                itemIndex,
                item,
                [&]{
                    ShowItemDescription(item);
                });

            if (minorColumn != 0 && minorColumn % 2 == 0)
            {
                minorColumn = 0;
                minorRow += 1;
            }

            if (minorRow != 0 && minorRow % 2 == 0)
            {
                minorRow = 0;
                majorRow += 1;
            }

            if (majorRow != 0 && majorRow % 2 == 0)
            {
                majorColumn += 1;
                majorRow = 0;
            }

            // Handle the final column
            if (majorColumn == 2 && minorColumn > 0)
            {
                minorRow += 1;
                minorColumn = 0;
            }

            mLogger.Debug() << "CorrectRows: " << item 
                << " mc: " << minorColumn << " MC: " << majorColumn 
                << " mr: " << minorRow << " MR: " << majorRow << "\n";
        }
    }

    void AddChildren()
    {
        ClearChildren();
        mDragTargets.clear();

        AddChildBack(&mFrame);
        AddChildBack(&mExit);
        AddChildBack(&mGoldDisplay);

        SetContainerTypeImage();
        AddChildBack(&mContainerTypeDisplay);

        for (auto& character : mCharacters)
        {
            AddChildBack(&character);
            mDragTargets.emplace_back(&character);
        }

        AddChildBack(&mWeapon);

        if (mGameState.GetParty()
            .GetActiveCharacter(mSelectedCharacter).IsSwordsman())
            AddChildBack(&mCrossbow);

        AddChildBack(&mArmor);

        for (auto& item : mInventoryItems)
        {
            AddChildBack(&item);
            mDragTargets.emplace_back(&item);
        }

    }

private:
    IGuiManager& mGuiManager;
    const Font& mFont;
    const Icons& mIcons;
    BAK::GameState& mGameState;
    NullDialogScene mDialogScene;

    BAK::Layout mLayout;

    Widget mFrame;

    std::vector<CharacterPortrait> mCharacters;
    ClickButtonImage mExit;
    TextBox mGoldDisplay;
    // click into shop or keys, etc.
    ClickButtonImage mContainerTypeDisplay;

    EquipmentSlot mWeapon;
    EquipmentSlot mCrossbow;
    EquipmentSlot mArmor;
    std::vector<InventorySlot> mInventoryItems;
    std::vector<IDragTarget*> mDragTargets;

    unsigned mSelectedCharacter;
    const Logging::Logger& mLogger;
};

}