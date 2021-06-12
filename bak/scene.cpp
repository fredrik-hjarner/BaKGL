#include "bak/scene.hpp"

#include "bak/logger.hpp"

#include "xbak/ResourceTag.h"
#include "xbak/TaggedResource.h"


#include <cassert>
#include <cctype>
#include <functional>
#include <unordered_map>

namespace BAK {

std::ostream& operator<<(std::ostream& os, const Scene& scene)
{
    os << "Scene :: " << scene.mSceneTag << " [";
    auto sep = ' ';
    for (const auto& a : scene.mActions)
    {
        os << sep << a;
        sep = '\n';
    }
    os << " ]\n";
    for (const auto& [key, imagePal] : scene.mImages)
    {
        const auto& [image, palKey] = imagePal;
        std::cout << "K: " << key << " " << image << " pal: " << palKey << "\n";
    }
    for (const auto& [key, pal] : scene.mPalettes)
        std::cout << "K: " << key << " " << pal << "\n";
    return os;
}

std::vector<Scene> LoadScenes(FileBuffer& fb)
{
    const auto& logger = Logging::LogState::GetLogger(__FUNCTION__);

    std::vector<SceneChunk> chunks;

    fb.DumpAndSkip(20);

    auto pageBuffer    = fb.Find(TAG_PAG);
    auto versionBuffer = fb.Find(TAG_VER);
    auto tt3Buffer     = fb.Find(TAG_TT3);
    auto tagBuffer     = fb.Find(TAG_TAG);
    
    const auto pages = pageBuffer.GetUint16LE();
    logger.Debug() << "Pages:" << pages << "\n";

    tt3Buffer.Skip(1);
    FileBuffer decompBuffer = FileBuffer(tt3Buffer.GetUint32LE());
    auto decomped = tt3Buffer.DecompressRLE(&decompBuffer);
    ResourceTag tags;
    tags.Load(&tagBuffer);

    for (const auto& [id, tag] : tags.GetTagMap())
        std::cout << "Id: " << id << " tag: " << tag << "\n";

    std::cout << "Loading movie chunks" << std::endl;

    while (!decompBuffer.AtEnd())
    {
        unsigned int code = decompBuffer.GetUint16LE();
        unsigned int size = code & 0x000f;
        code &= 0xfff0;
        auto action = static_cast<Actions>(code);
        logger.Debug() << "Code: " << std::hex << code << " " 
            << action << std::dec << " ";
        
        if ((code == 0x1110) && (size == 1))
        {
            unsigned int id = decompBuffer.GetUint16LE();
            std::string name;
            if (tags.Find(id, name))
            {
                logger.Debug() << "Name: " << name <<"\n";
                chunks.emplace_back(action, name, std::vector<std::int16_t>{});
            }
        }
        else if (size == 0xf)
        {
            std::string name = decompBuffer.GetString();
            std::transform(name.begin(), name.end(), name.begin(),
                [](auto c){ return std::toupper(c); });
            logger.Debug() << "Name: " << name <<"\n";
            if (decompBuffer.GetBytesLeft() & 1)
                decompBuffer.DumpAndSkip(1);
            chunks.emplace_back(action, name, std::vector<std::int16_t>{});
        }
        else
        {
            std::stringstream ss{};
            std::vector<std::int16_t> args{};
            for (unsigned int i = 0; i < size; i++)
                args.emplace_back(decompBuffer.GetSint16LE());
            std::cout << " args [ ";
            auto sep = ' ';
            for (const auto& a : args)
            {
                std::cout << sep << a;
                sep = ',';
            }
            std::cout << "]\n";
            chunks.emplace_back(
                action,
                std::optional<std::string>{},
                args);
        }
    }

    std::vector<Scene> scenes{};
    Scene currentScene;
    bool loadingScene = false;
    std::optional<unsigned> imageSlot = 0;
    std::optional<unsigned> paletteSlot = 0;
    std::unordered_map<unsigned, std::string> palettes{};
    std::unordered_map<
        unsigned,
        std::pair<std::string, unsigned>> images{};

    for (const auto& chunk : chunks)
    {
        switch (chunk.mAction)
        {
        case Actions::SLOT_IMAGE:
            imageSlot = chunk.mArguments[0];
            break;
        case Actions::SLOT_PALETTE:
            paletteSlot = chunk.mArguments[0];
            break;
        case Actions::SET_SCENE:
            if (loadingScene)
            {
                scenes.emplace_back(currentScene);
                assert(chunk.mResourceName);
                //paletteSlot = std::optional<unsigned>{};
                imageSlot   = std::optional<unsigned>{};
                currentScene.mSceneTag = *chunk.mResourceName;
                currentScene.mActions = std::vector<SceneAction>{};
                currentScene.mPalettes = palettes;
                currentScene.mImages = images;
            }
            else
            {
                loadingScene = true;
                assert(chunk.mResourceName);
                //paletteSlot = std::optional<unsigned>{};
                imageSlot   = std::optional<unsigned>{};
                currentScene.mSceneTag = *chunk.mResourceName;
                currentScene.mActions = std::vector<SceneAction>{};
                currentScene.mPalettes = palettes;
                currentScene.mImages = images;
            }
            break;
        case Actions::LOAD_PALETTE:
            assert(loadingScene);
            assert(chunk.mResourceName);
            assert(paletteSlot);
            palettes.emplace(*paletteSlot, *chunk.mResourceName);
            break;
        case Actions::LOAD_IMAGE:
        {
            assert(loadingScene);
            assert(chunk.mResourceName);
            assert(imageSlot);
            assert(paletteSlot);
            auto name = *chunk.mResourceName;
            (*(name.end() - 1)) = 'X';
            std::cout << "BMX: " << name << "\n";
            images.emplace(
                *imageSlot,
                std::make_pair(name, *paletteSlot));
        }
            break;
        case Actions::DRAW_SPRITE1: [[fallthrough]];
        case Actions::DRAW_SPRITE0:
        {
            const auto scaled = chunk.mArguments.size() == 6;
            currentScene.mActions.emplace_back(
                DrawSprite0{
                    false,
                    chunk.mArguments[0],
                    chunk.mArguments[1],
                    chunk.mArguments[2],
                    chunk.mArguments[3],
                    static_cast<std::int16_t>(scaled ? chunk.mArguments[5] : 0),
                    static_cast<std::int16_t>(scaled ? chunk.mArguments[6] : 0)});
        }
            break;
        case Actions::DRAW_SPRITE_FLIP:
        {
            const auto scaled = chunk.mArguments.size() >= 5;
            currentScene.mActions.emplace_back(
                DrawSprite0{
                    true,
                    chunk.mArguments[0],
                    chunk.mArguments[1],
                    chunk.mArguments[2],
                    chunk.mArguments[3],
                    static_cast<std::int16_t>(scaled ? chunk.mArguments[5] : 0),
                    static_cast<std::int16_t>(scaled ? chunk.mArguments[6] : 0)});
        }
            break;

        default:
            logger.Debug() << "Unhandled action: " << chunk.mAction << "\n";
            break;
        }
    }

    for (const auto& s : scenes)
        std::cout << "Scene: " << s << "\n";

    return scenes;
}

}