#include "gui/inventory/inventoryScreen.hpp"

namespace Gui {

InventoryScreen::InventoryScreen(
    IGuiManager& guiManager,
    const Backgrounds& backgrounds,
    const Icons& icons,
    const Font& font,
    BAK::GameState& gameState)
:
    // Black background
    Widget{
        RectTag{},
        glm::vec2{0, 0},
        glm::vec2{320, 200},
        Color::black,
        true
    },
    mGuiManager{guiManager},
    mFont{font},
    mIcons{icons},
    mGameState{gameState},
    mDialogScene{
        []{},
        []{},
        [](const auto&){}
    },
    mLayout{sLayoutFile},
    mFrame{
        ImageTag{},
        backgrounds.GetSpriteSheet(),
        backgrounds.GetScreen(sBackground),
        glm::vec2{0},
        GetPositionInfo().mDimensions,
        true
    },
    mCharacters{},
    mNextPage{
        mLayout.GetWidgetLocation(mNextPageRequest),
        mLayout.GetWidgetDimensions(mNextPageRequest),
        std::get<Graphics::SpriteSheetIndex>(mIcons.GetButton(mNextPageButton)),
        std::get<Graphics::TextureIndex>(mIcons.GetButton(mNextPageButton)),
        std::get<Graphics::TextureIndex>(mIcons.GetPressedButton(mNextPageButton)),
        [this]{ AdvanceNextPage(); },
        []{}
    },
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
        [this](auto& item){ MoveItemToContainer(item); },
        mLayout.GetWidgetLocation(mContainerTypeRequest),
        mLayout.GetWidgetDimensions(mContainerTypeRequest),
        Graphics::SpriteSheetIndex{0},
        Graphics::TextureIndex{0},
        Graphics::TextureIndex{0},
        [&]{
            ShowContainer();
            RefreshGui();
        },
        []{}
    },
    mContainerScreen{
        {11, 11},
        {294, 121},
        mIcons,
        mFont,
        [this](const auto& item){
            ShowItemDescription(item);
        }
    },
    mShopScreen{
        {11, 11},
        {294, 121},
        mIcons,
        mFont,
        [this](const auto& item){
            ShowItemDescription(item);
        }
    },
    mWeapon{
        [this](auto& item){
            MoveItemToEquipmentSlot(item, BAK::ItemType::Sword); },
        glm::vec2{13, 15},
        glm::vec2{80, 29},
        mIcons,
        130
    },
    mCrossbow{
        [this](auto& item){
            MoveItemToEquipmentSlot(item, BAK::ItemType::Crossbow); },
        glm::vec2{13, 15 + 29},
        glm::vec2{80, 29},
        mIcons,
        130
    },
    mArmor{
        [this](auto& item){
            MoveItemToEquipmentSlot(item, BAK::ItemType::Armor); },
        glm::vec2{13, 15 + 29 * 2},
        glm::vec2{80, 58},
        mIcons,
        131
    },
    mInventoryItems{},
    mSelectedCharacter{},
    mDisplayContainer{false},
    mContainer{nullptr},
    mNeedRefresh{false},
    mLogger{Logging::LogState::GetLogger("Gui::InventoryScreen")}
{
    mCharacters.reserve(3);
    ClearContainer();
}

void InventoryScreen::SetSelectedCharacter(
    BAK::ActiveCharIndex character)
{
    ShowCharacter(character);
    RefreshGui();
}

void InventoryScreen::ClearContainer()
{
    SetContainerTypeImage(11);

    mSelectedCharacter.reset();
    mContainerScreen.SetContainer(&mGameState.GetParty().GetKeys());
    mContainer = nullptr;
    mDisplayContainer = false;
}

void InventoryScreen::SetContainer(BAK::IContainer* container)
{
    ASSERT(container != nullptr);

    mContainer = container;

    if (container->IsShop())
    {
        SetContainerTypeImage(7);
        mShopScreen.SetContainer(container);
    }
    else
    {
        SetContainerTypeImage(0);
        mContainerScreen.SetContainer(container);
    }

    ShowContainer();
    RefreshGui();
}

/* Widget */
bool InventoryScreen::OnMouseEvent(const MouseEvent& event)
{
    const bool handled = Widget::OnMouseEvent(event);

    // Don't refresh things until we have finished
    // processing this event. This prevents deleting
    // children that are about to handle it.
    if (mNeedRefresh)
    {
        RefreshGui();
        mNeedRefresh = false;
    }

    return handled;
}

void InventoryScreen::PropagateUp(const DragEvent& event)
{
    mLogger.Debug() << __FUNCTION__ << " ev: " << event << "\n";

    if (std::holds_alternative<DragStarted>(event))
    {
        HighlightValidDrops(
            *static_cast<InventorySlot*>(
                std::get<DragStarted>(event).mWidget));
    }
    else if (std::holds_alternative<DragEnded>(event))
    {
        UnhighlightDrops();
    }

    bool handled = Widget::OnDragEvent(event);
    if (handled)
        return;
}

void InventoryScreen::RefreshGui()
{
    ClearChildren();

    UpdatePartyMembers();
    UpdateGold();

    if (mDisplayContainer)
    {
        if (mContainer && mContainer->IsShop())
        {
            mShopScreen.RefreshGui();
        }
        else
        {
            mContainerScreen.RefreshGui();
        }
    }
    else
        UpdateInventoryContents();

    AddChildren();
}

void InventoryScreen::SetContainerTypeImage(unsigned containerType)
{
    const auto [ss, ti, dims] = mIcons.GetInventoryMiscIcon(containerType);
    mContainerTypeDisplay.SetTexture(ss, ti);
    mContainerTypeDisplay.CenterImage(dims);
}

void InventoryScreen::ShowContainer()
{
    mDisplayContainer = true;
    mSelectedCharacter.reset();
}

void InventoryScreen::ShowCharacter(BAK::ActiveCharIndex character)
{
    mDisplayContainer = false;
    mSelectedCharacter = character;
    mGameState.SetActiveCharacter(GetCharacter(character).mCharacterIndex);
}

void InventoryScreen::TransferItemFromCharacterToCharacter(
    InventorySlot& slot,
    BAK::ActiveCharIndex source,
    BAK::ActiveCharIndex dest)
{
    auto item = slot.GetItem();

    if (item.IsEquipped() 
        && (item.IsItemType(BAK::ItemType::Sword)
            || item.IsItemType(BAK::ItemType::Staff)))
    {
        auto& srcC = GetCharacter(source);
        auto& dstC = GetCharacter(dest);

        if (dstC.CanSwapItem(item))
        {
            ASSERT(srcC.IsSwordsman() == dstC.IsSwordsman());
            const auto sourceItem = item;
            const auto destItemIt = dstC.GetInventory()
                .FindEquipped(item.GetObject().mType);
            const auto destItem = *destItemIt;
            ASSERT(destItemIt != dstC.GetInventory().GetItems().end());
            const auto dstIndex = std::distance(
                dstC.GetInventory().GetItems().begin(),
                destItemIt);

            dstC.GetInventory().RemoveItem(
                BAK::InventoryIndex{static_cast<unsigned>(dstIndex)});
            dstC.GiveItem(sourceItem);
            srcC.GetInventory().RemoveItem(slot.GetItemIndex());
            srcC.GiveItem(destItem);

            srcC.CheckPostConditions();
            dstC.CheckPostConditions();
        }
        else
        {
            StartDialog(BAK::DialogSources::mCantDiscardOnlyWeapon);
        }

        return;
    }

    if (GetCharacter(dest).CanAddItem(item))
    {
        GetCharacter(dest).GiveItem(item);
        GetCharacter(source)
            .GetInventory()
            .RemoveItem(slot.GetItemIndex());
    }
    else
    {
        // Set source and dest cahracter indices here..
        mGameState.SetDialogContext(1);
        StartDialog(BAK::DialogSources::mContainerHasNoRoomForItem);
    }

    mLogger.Debug() << __FUNCTION__ << "Source: " 
        << GetCharacter(source).GetInventory() 
        << "\n" << "Dest: " << GetCharacter(dest).GetInventory() << "\n";
    GetCharacter(source).CheckPostConditions();
}

void InventoryScreen::TransferItemFromContainerToCharacter(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    ASSERT(mContainer);

    auto item = slot.GetItem();

    if (item.IsMoney() || item.IsKey())
    {
        ASSERT(mDisplayContainer);
        mGameState.GetParty().AddItem(item);
        mContainer->GetInventory()
            .RemoveItem(slot.GetItemIndex());
    }
    else if (GetCharacter(character).GiveItem(item))
    {
        mContainer->GetInventory()
            .RemoveItem(slot.GetItemIndex());
    }
    else
    {
    }
}

void InventoryScreen::SellItem(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    ASSERT(mContainer);
    mGameState.GetParty().GainMoney(
        mShopScreen.GetBuyPrice(slot.GetItem()));
    mContainer->GiveItem(slot.GetItem());
    GetCharacter(character).GetInventory()
        .RemoveItem(slot.GetItemIndex());
    mNeedRefresh = true;
}

void InventoryScreen::BuyItem(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    ASSERT(mContainer);

    auto item = slot.GetItem();
    const auto price = mShopScreen.GetSellPrice(slot.GetItemIndex());
    if (mGameState.GetParty().GetGold().mValue >= price.mValue)
    {
        ASSERT(GetCharacter(character).CanAddItem(item));
        if (item.IsKey())
        {
            ASSERT(mDisplayContainer);
            mGameState.GetParty().AddItem(item);
        }
        else
        {
            const auto result = GetCharacter(character).GiveItem(item);
            ASSERT(result);
        }
        mGameState.GetParty().LoseMoney(price);
    }

    mNeedRefresh = true;
}

void InventoryScreen::TransferItemToShop(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    ASSERT(mContainer);

    const auto& item = slot.GetItem();
    if (item.IsEquipped() 
        && (item.IsItemType(BAK::ItemType::Sword)
            || item.IsItemType(BAK::ItemType::Staff)))
    {
        StartDialog(BAK::DialogSources::mCantDiscardOnlyWeapon);
        return;
    }

    if (true) // mShopScreen.CanBuyItem(slot.GetItem());
    {
        mGameState.SetItemValue(mShopScreen.GetBuyPrice(slot.GetItem()));
        StartDialog(BAK::DialogSources::mSellItemDialog);

        mDialogScene.SetDialogFinished(
            [this, &slot, character](const auto& choice)
            {
                ASSERT(choice);
                if (choice->mValue == BAK::Keywords::sYesIndex)
                {
                    SellItem(slot, character);
                }
                mDialogScene.ResetDialogFinished();
            });
    }
    else
    {
        mGameState.SetDialogContext(0xb);
        StartDialog(BAK::DialogSources::mContainerHasNoRoomForItem);
    }
}

void InventoryScreen::TransferItemFromShopToCharacter(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    ASSERT(mContainer);
    if (GetCharacter(character).CanAddItem(slot.GetItem()))
    {
        mGameState.SetItemValue(mShopScreen.GetSellPrice(slot.GetItemIndex()));
        StartDialog(BAK::DialogSources::mBuyItemDialog);

        mDialogScene.SetDialogFinished(
            [this, &slot, character](const auto& choice)
            {
                ASSERT(choice);
                // FIXME: Add haggling...
                if (choice->mValue == 0x104)
                {
                    BuyItem(slot, character);
                }
                mDialogScene.ResetDialogFinished();
            });
    }
    else
    {
        mGameState.SetDialogContext(0xb);
        StartDialog(BAK::DialogSources::mContainerHasNoRoomForItem);
    }
}

void InventoryScreen::TransferItemToCharacter(
    InventorySlot& slot,
    BAK::ActiveCharIndex character)
{
    CheckExclusivity();

    // When displaying keys, can't transfer items
    if (mDisplayContainer && mContainer == nullptr)
        return;

    if (mSelectedCharacter && (*mSelectedCharacter != character))
    {
        TransferItemFromCharacterToCharacter(
            slot,
            *mSelectedCharacter,
            character);
    }
    else
    {
        if (mContainer->IsShop())
        {
            TransferItemFromShopToCharacter(slot, character);
        }
        else
        {
            TransferItemFromContainerToCharacter(slot, character);
        }
    }

    GetCharacter(character).CheckPostConditions();
    mNeedRefresh = true;
}

void InventoryScreen::MoveItemToEquipmentSlot(
    InventorySlot& item,
    BAK::ItemType slot)
{
    ASSERT(mSelectedCharacter);

    mLogger.Debug() << "Move item to equipment slot: " 
        << item.GetItem() << " " << BAK::ToString(slot) << "\n";

    if (slot == BAK::ItemType::Sword)
    {
        if (GetCharacter(*mSelectedCharacter).IsSwordsman())
            GetCharacter(*mSelectedCharacter)
                .ApplyItemToSlot(item.GetItemIndex(), slot);
        else
            GetCharacter(*mSelectedCharacter)
                .ApplyItemToSlot(item.GetItemIndex(), BAK::ItemType::Staff);
    }
    else
    {
        GetCharacter(*mSelectedCharacter)
            .ApplyItemToSlot(item.GetItemIndex(), slot);
    }

    GetCharacter(*mSelectedCharacter).CheckPostConditions();

    mNeedRefresh = true;
}

void InventoryScreen::MoveItemToContainer(InventorySlot& slot)
{
    // Can't move an item in a container to the container...
    if (mDisplayContainer)
        return;

    ASSERT(mSelectedCharacter);

    const auto& item = slot.GetItem();
    if (item.IsEquipped() 
        && (item.IsItemType(BAK::ItemType::Sword)
            || item.IsItemType(BAK::ItemType::Staff)))
    {
        StartDialog(BAK::DialogSources::mCantDiscardOnlyWeapon);
        return;
    }
    mLogger.Debug() << "Move item to container: " << slot.GetItem() << "\n";

    if (mContainer && mContainer->IsShop())
    {
        ASSERT(mSelectedCharacter);
        TransferItemToShop(slot, *mSelectedCharacter);
    }
    else if (mContainer)
    {
        mContainer->GetInventory().AddItem(slot.GetItem());
        GetCharacter(*mSelectedCharacter).GetInventory().RemoveItem(slot.GetItemIndex());
    }

    GetCharacter(*mSelectedCharacter).CheckPostConditions();
    mNeedRefresh = true;
}

void InventoryScreen::UseItem(InventorySlot& item, BAK::InventoryIndex itemIndex)
{
    ASSERT(mSelectedCharacter);
    auto& applyTo = GetCharacter(*mSelectedCharacter).GetInventory().GetAtIndex(itemIndex);
    mLogger.Debug() << "Use item : " << item.GetItem() << " with " << applyTo << "\n";
    GetCharacter(*mSelectedCharacter).CheckPostConditions();
}

void InventoryScreen::AdvanceNextPage()
{
    mLogger.Debug() << __FUNCTION__ << "\n";
    if (mDisplayContainer)
    {
        mShopScreen.AdvanceNextPage();
        mNeedRefresh = true;
    }
}

void InventoryScreen::ShowItemDescription(const BAK::InventoryItem& item)
{
    unsigned context = 0;
    auto dialog = BAK::KeyTarget{0};
    // FIXME: Probably want to put this logic elsewhere...
    if (item.GetObject().mType == BAK::ItemType::Scroll)
    {
        context = item.mCondition;
        dialog = BAK::DialogSources::GetScrollDescription();
    }
    else
    {
        context = item.mItemIndex.mValue;
        dialog = BAK::DialogSources::GetItemDescription();
    }

    mGameState.SetDialogContext(context);
    StartDialog(dialog);
}

void InventoryScreen::HighlightValidDrops(const InventorySlot& slot)
{
    const auto& party = mGameState.GetParty();
    BAK::ActiveCharIndex person{0};
    do
    {
        if (person != mSelectedCharacter)
        {
            const auto& item = slot.GetItem();
            const auto mustSwap = item.IsEquipped() 
                && (item.IsItemType(BAK::ItemType::Sword)
                    || item.IsItemType(BAK::ItemType::Staff));
            const auto giveable = GetCharacter(person)
                .CanAddItem(slot.GetItem());
            if ((mustSwap && (GetCharacter(person).CanSwapItem(item)))
                || (giveable && !mustSwap))
            {
                mCharacters[person.mValue].SetColor(glm::vec4{.0, .05, .0, 1}); 
                mCharacters[person.mValue].SetColorMode(Graphics::ColorMode::TintColor);
            }
            else
            {
                mCharacters[person.mValue].SetColor(glm::vec4{.05, .0, .0, 1}); 
                mCharacters[person.mValue].SetColorMode(Graphics::ColorMode::TintColor);
            }
        }

        person = party.NextActiveCharacter(person);
    } while (person != BAK::ActiveCharIndex{0});
}

void InventoryScreen::UnhighlightDrops()
{
    const auto& party = mGameState.GetParty();
    BAK::ActiveCharIndex person{0};
    do
    {
        if (person != mSelectedCharacter)
        {
                mCharacters[person.mValue].SetColor(glm::vec4{.05, .05, .05, 1}); 
                mCharacters[person.mValue].SetColorMode(Graphics::ColorMode::TintColor);
        }

        person = party.NextActiveCharacter(person);
    } while (person != BAK::ActiveCharIndex{0});
}

void InventoryScreen::UpdatePartyMembers()
{
    mCharacters.clear();

    const auto& party = mGameState.GetParty();
    BAK::ActiveCharIndex person{0};
    do
    {
        const auto [spriteSheet, image, _] = mIcons.GetCharacterHead(
            party.GetCharacter(person).GetIndex().mValue);
        mCharacters.emplace_back(
            [this, character=person](InventorySlot& slot){
                TransferItemToCharacter(slot, character);
            },
            [this, character=person]{
                // Switch character
                SetSelectedCharacter(character);
            },
            [this, character=person]{
                mGuiManager.ShowCharacterPortrait(character);
            },
            ImageTag{},
            spriteSheet,
            image,
            mLayout.GetWidgetLocation(person.mValue),
            mLayout.GetWidgetDimensions(person.mValue),
            true
        );

        if (person != mSelectedCharacter)
        {
            mCharacters[person.mValue].SetColor(glm::vec4{.05, .05, .05, 1}); 
            mCharacters[person.mValue].SetColorMode(Graphics::ColorMode::TintColor);
        }

        person = party.NextActiveCharacter(person);
    } while (person != BAK::ActiveCharIndex{0});
}

void InventoryScreen::UpdateGold()
{
    const auto gold = mGameState.GetParty().GetGold();
    const auto text = ToString(gold);
    const auto [textDims, _] = mGoldDisplay.AddText(mFont, text);

    // Justify text to the right
    const auto basePos = mLayout.GetWidgetLocation(mGoldRequest);
    const auto newPos = basePos 
        + glm::vec2{
            3 + mLayout.GetWidgetDimensions(mGoldRequest).x - textDims.x,
            4};

    mGoldDisplay.SetPosition(newPos);
}

void InventoryScreen::UpdateInventoryContents()
{
    CheckExclusivity();

    const auto& inventory = std::invoke([&]() -> const BAK::Inventory& {
        if (mDisplayContainer)
        {
            ASSERT(mContainer == nullptr);
            return mGameState.GetParty().GetKeys().GetInventory();
        }
        else
        {
            return GetCharacter(*mSelectedCharacter).GetInventory();
        }
    });


    mInventoryItems.clear();
    mInventoryItems.reserve(inventory.GetNumberItems());

    std::vector<
        std::pair<
            BAK::InventoryIndex,
        const BAK::InventoryItem*>> items{};

    const auto numItems = inventory.GetItems().size();
    items.reserve(numItems);

    unsigned index{0};
    std::transform(
        inventory.GetItems().begin(),
        inventory.GetItems().end(),
        std::back_inserter(items),
        [&index](const auto& i) -> std::pair<BAK::InventoryIndex, const BAK::InventoryItem*> {
            return std::make_pair(BAK::InventoryIndex{index++}, &i);
        });

    mCrossbow.ClearItem();
    mArmor.ClearItem();

    const auto slotDims = glm::vec2{40, 29};

    // Add equipped items
    for (const auto& [invIndex, itemPtr] : items)
    {
        ASSERT(itemPtr);
        const auto& item = *itemPtr;
        const auto& [ss, ti, _] = mIcons.GetInventoryIcon(item.mItemIndex.mValue);

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
                invIndex,
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
                invIndex,
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
                invIndex,
                item,
                [&]{
                    ShowItemDescription(item);
                });

            continue;
        }
    }

    // Don't display equipped items in the inventory
    items.erase(
        std::remove_if(
            items.begin(), items.end(),
            [&](const auto& i){
                return inventory
                    .GetAtIndex(std::get<BAK::InventoryIndex>(i))
                    .IsEquipped();
        }),
        items.end());

    // Sort by item size to ensure nice packing
    std::sort(items.begin(), items.end(), [](const auto& l, const auto& r) 
    {
        return (std::get<1>(l)->GetObject().mImageSize 
            > std::get<1>(r)->GetObject().mImageSize);
    });

    const auto pos  = glm::vec2{105, 11};
    auto arranger = ItemArranger{};
    arranger.PlaceItems(
        items.begin(),
        items.end(),
        6,
        4,
        slotDims,
        false,
        [&](auto invIndex, const auto& item, const auto itemPos, const auto dims)
        {
            mInventoryItems.emplace_back(
                [this, index=invIndex](auto& item){
                    UseItem(item, BAK::InventoryIndex{index}); },
                itemPos + pos,
                dims,
                mFont,
                mIcons,
                invIndex,
                item,
                [&]{
                    ShowItemDescription(item);
                });
        });
}

void InventoryScreen::AddChildren()
{
    AddChildBack(&mFrame);
    AddChildBack(&mExit);
    AddChildBack(&mGoldDisplay);

    AddChildBack(&mContainerTypeDisplay);

    for (auto& character : mCharacters)
    {
        AddChildBack(&character);
    }

    if (mSelectedCharacter && !mDisplayContainer)
    {
        AddChildBack(&mWeapon);

        if (GetCharacter(*mSelectedCharacter).IsSwordsman())
            AddChildBack(&mCrossbow);

        AddChildBack(&mArmor);

        for (auto& item : mInventoryItems)
            AddChildBack(&item);
    }
    else if (mDisplayContainer)
    {
        if (mContainer && mContainer->IsShop())
        {
            AddChildBack(&mShopScreen);
            if (mShopScreen.GetMaxPages() > 1)
                AddChildBack(&mNextPage);
        }
        else
        {
            AddChildBack(&mContainerScreen);
        }
    }
}

void InventoryScreen::CheckExclusivity()
{
    ASSERT(bool{mSelectedCharacter} ^ mDisplayContainer);
}

}
