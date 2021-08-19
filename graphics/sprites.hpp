#pragma once

#include "graphics/plane.hpp"
#include "graphics/renderer.hpp"
#include "graphics/texture.hpp"
#include "graphics/types.hpp"

#include "com/logger.hpp"

#include <GL/glew.h>

#include <memory>
#include <optional>
#include <vector>

namespace Graphics {

class Sprites
{
public:
    Sprites() noexcept
    :
        mNonSpriteObjects{1},
        mVertexArray{},
        mBuffers{},
        mTextureBuffer{},
        mObjects{},
        mSpriteDimensions{}
    {
    }

    Sprites(const Sprites&) = delete;
    Sprites& operator=(const Sprites&) = delete;

    Sprites(Sprites&& other) noexcept
    :
        mNonSpriteObjects{other.mNonSpriteObjects}
    {
        (*this) = std::move(other);
    }

    Sprites& operator=(Sprites&& other) noexcept
    {
        this->mVertexArray = std::move(other.mVertexArray);
        this->mBuffers = std::move(other.mBuffers);
        this->mTextureBuffer = std::move(other.mTextureBuffer);
        this->mObjects = other.mObjects;
        return *this;
    }

    void BindGL() const
    {
        mVertexArray.BindGL();
        mTextureBuffer.BindGL();
    }

    void UnbindGL() const
    {
        mVertexArray.UnbindGL();
        mTextureBuffer.UnbindGL();
    }

    void LoadTexturesGL(const TextureStore& textures)
    {
        mTextureBuffer.LoadTexturesGL(
            textures.GetTextures(),
            textures.GetMaxDim());

        // Normal quad for use as arbitrary rectangle
        mObjects.AddObject(Quad{1.0, 1.0, 1.0, 0});
        // This is why mNonSpriteObjects = 1;

        for (unsigned i = 0; i < textures.GetTextures().size(); i++)
        {
            const auto& tex = textures.GetTexture(i);
            mObjects.AddObject(
                Quad{
                    static_cast<double>(tex.GetWidth()),
                    static_cast<double>(tex.GetHeight()),
                    static_cast<double>(textures.GetMaxDim()),
                    i});
            mSpriteDimensions.emplace_back(
                tex.GetWidth(),
                tex.GetHeight());
        }

        mVertexArray.BindGL();

        mBuffers.AddBuffer("vertex", 0, 3);
        mBuffers.AddBuffer("textureCoord", 1, 3);

        mBuffers.LoadBufferDataGL("vertex", GL_ARRAY_BUFFER, mObjects.mVertices);
        mBuffers.LoadBufferDataGL("textureCoord", GL_ARRAY_BUFFER, mObjects.mTextureCoords);
        mBuffers.LoadBufferDataGL(mBuffers.mElementBuffer, GL_ELEMENT_ARRAY_BUFFER, mObjects.mIndices);
        mBuffers.BindArraysGL();
        
        UnbindGL();
    }

    std::size_t size()
    {
        return mSpriteDimensions.size();
    }

    auto GetRect() const
    {
        return mObjects.GetObject(0);
    }

    auto Get(unsigned i) const
    {
        return mObjects.GetObject(i + mNonSpriteObjects);
    }

    auto GetDimensions(unsigned i) const
    {
        assert(i < mSpriteDimensions.size());
        return mSpriteDimensions[i];
    }

private:
    const std::size_t mNonSpriteObjects;
    VertexArrayObject mVertexArray;
    GLBuffers mBuffers;
    TextureBuffer mTextureBuffer;
    QuadStorage mObjects;
    std::vector<glm::vec2> mSpriteDimensions;
};

class SpriteManager
{
public:
    SpriteManager()
    :
        mSprites(),
        mNextSpriteSheet{0},
        mActiveSpriteSheet{}
    {
        // Seems excessive...
        mSprites.reserve(128);
    }

    auto AddSpriteSheet()
    {
        const auto& logger = Logging::LogState::GetLogger("SpriteManager");
        const auto spriteSheetIndex = NextSpriteSheet();
        logger.Debug() << "Adding sprite sheet index: " << spriteSheetIndex << "\n";
        assert(mSprites.size() == spriteSheetIndex);
        mSprites.emplace_back();
        return spriteSheetIndex;
    }

    void DeactivateSpriteSheet()
    {
        if (mActiveSpriteSheet)
        {
            GetSpriteSheet(*mActiveSpriteSheet).UnbindGL();
            mActiveSpriteSheet = std::optional<SpriteSheetIndex>{};
        }
    }

    void ActivateSpriteSheet(SpriteSheetIndex spriteSheet)
    {
        if (!mActiveSpriteSheet || spriteSheet != *mActiveSpriteSheet)
        {
            GetSpriteSheet(spriteSheet).BindGL();
            mActiveSpriteSheet = spriteSheet;
        }
    }

    Sprites& GetSpriteSheet(SpriteSheetIndex spriteSheet)
    {
        assert(mSprites.size() > spriteSheet);
        return mSprites[spriteSheet];
    }

private:
    SpriteSheetIndex NextSpriteSheet()
    {
        return mNextSpriteSheet++;
    }

    std::vector<Sprites> mSprites;

    SpriteSheetIndex mNextSpriteSheet;
    std::optional<SpriteSheetIndex> mActiveSpriteSheet;
};

}
