#pragma once

#include "graphics/glm.hpp"
#include "graphics/types.hpp"

#include <glm/glm.hpp>

#include <functional>
#include <optional>
#include <vector>
#include <unordered_map>

namespace Graphics {

enum class ColorMode
{
    // Use the color from the given texture
    Texture = 0,
    // Use a solid color
    SolidColor = 1,
    // Tint the texture this color (respects texture alpha)
    TintColor = 2 
};

class IGuiElement
{
public:
    IGuiElement(
        std::optional<Graphics::SpriteSheetIndex> spriteSheet,
        Graphics::TextureIndex texture,
        Graphics::ColorMode colorMode,
        glm::vec4 color,
        glm::vec3 position,
        glm::vec3 dims,
       // glm::vec3 scale,
        bool clipToDims)
    :
        mSpriteSheet{spriteSheet},
        mTexture{texture},
        mColorMode{colorMode},
        mColor{color},
        mPosition{position},
        mDimensions{dims},
        //mScale{scale},
        mClipToDims{clipToDims}
    {}

    virtual const std::vector<IGuiElement*>& GetChildren() const = 0;

    virtual ~IGuiElement(){}

    std::optional<Graphics::SpriteSheetIndex> mSpriteSheet;
    Graphics::TextureIndex mTexture;
    Graphics::ColorMode mColorMode;
    glm::vec4 mColor;
    
    glm::vec3 mPosition;
    glm::vec3 mDimensions;
    glm::vec3 mScale;

    bool mClipToDims;
};

}
