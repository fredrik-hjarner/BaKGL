#pragma once

#include "graphics/IGuiElement.hpp"
#include "graphics/shaderProgram.hpp"
#include "graphics/sprites.hpp"
#include "graphics/texture.hpp"
#include "graphics/types.hpp"

#include "com/logger.hpp"

#include <GL/glew.h>

#include <cmath>

namespace Graphics {

// Tightly coupled with the GUI shader

class GuiCamera
{
public:
    GuiCamera(
        float width,
        float height,
        float scale,
        const ShaderProgramHandle& shader)
    :
        mWidth{width},
        mHeight{height},
        mScale{scale},
        mScaleMatrix{
            glm::scale(glm::mat4{1}, glm::vec3{scale, scale, 0})},
        mViewMatrix{
            glm::ortho(
                0.0f,
                width,
                height,
                0.0f,
                -1.0f,
                1.0f)},
        mModelMatrix{glm::mat4{1.0f}},
        mMVP{glm::mat4{1.0f}},
        mMvpMatrixId{shader.GetUniformLocation("MVP")},
        mModelMatrixId{shader.GetUniformLocation("M")},
        mViewMatrixId{shader.GetUniformLocation("V")}
    {
    }

    void CalculateMatrices()
    {
        mScaleMatrix = glm::scale(
            glm::mat4{1},
            glm::vec3{mScale, mScale, 0});
        mViewMatrix = glm::ortho(
            0.0f,
            mWidth,
            mHeight,
            0.0f,
            -1.0f,
            1.0f);
    }

    void UpdateModelViewMatrix(const glm::mat4& modelMatrix)
    {
        mModelMatrix = modelMatrix;
        mMVP = mViewMatrix * mScaleMatrix * mModelMatrix;

        ShaderProgramHandle::SetUniform(mMvpMatrixId  , mMVP);
        ShaderProgramHandle::SetUniform(mModelMatrixId, mModelMatrix);
        ShaderProgramHandle::SetUniform(mViewMatrixId , mViewMatrix);
    }

    void ScissorRegion(glm::vec2 topLeft, glm::vec2 dimensions)
    {
        // So bottom in terms of glScissor is going to be:
        // screenHeight - scaledBottom
        // Because we need to account for the bottom starting
        // at the height of the screen
        glScissor(
            topLeft.x * mScale,
            mHeight - (topLeft.y + dimensions.y)*mScale,
            dimensions.x * mScale,
            dimensions.y * mScale);
        glEnable(GL_SCISSOR_TEST);
    }

    void DisableScissor()
    {
        glDisable(GL_SCISSOR_TEST);
    }

private:
    float mWidth;
    float mHeight;
    float mScale;

    glm::mat4 mScaleMatrix;
    glm::mat4 mViewMatrix;
    glm::mat4 mModelMatrix;

    glm::mat4 mMVP;

    GLuint mMvpMatrixId;
    GLuint mModelMatrixId;
    GLuint mViewMatrixId;

};

class GuiRenderer
{
public:

    static constexpr auto vertexShader   = "gui.vert.glsl";
    static constexpr auto fragmentShader = "gui.frag.glsl";

    GuiRenderer(
        float width,
        float height,
        float scale,
        SpriteManager& spriteManager)
    :
        mShader{ShaderProgram{vertexShader, fragmentShader}
            .Compile()},
        mSpriteManager{spriteManager},
        mDimensions{width, height, scale},
        mCamera{
            width,
            height,
            scale,
            mShader
        },
        mBlockColorId{mShader.GetUniformLocation("blockColor")},
        mColorModeId{mShader.GetUniformLocation("colorMode")},
        mRenderCalls{0},
        mLogger{Logging::LogState::GetLogger("GuiRenderer")}
    {}

    void RenderGui(
        Graphics::IGuiElement* element)
    {
        mRenderCalls = 0;
        mLogger.Spam() << "Beginning Render\n";
        RenderGuiImpl(
            glm::vec3{0},
            element);
        mLogger.Spam() << "Rendered Gui, Calls: " << mRenderCalls << "\n";
    }

    void RenderGuiImpl(
        glm::vec2 translate,
        Graphics::IGuiElement* element)
    {
        mRenderCalls++;
        assert(element);
        mLogger.Spam() << "Rendering GUI Element: " << *element << "\n";

        const auto& di = element->GetDrawInfo();
        const auto& pi = element->GetPositionInfo();

        auto finalPos = translate + pi.mPosition;

        if (di.mDrawMode == DrawMode::ClipRegion)
        {
            mCamera.ScissorRegion(
                finalPos,
                pi.mDimensions);
        }
        else
        {
            mSpriteManager.ActivateSpriteSheet(di.mSpriteSheet);

            const auto sprScale = glm::scale(glm::mat4{1}, glm::vec3{pi.mDimensions, 0});
            const auto sprTrans = glm::translate(glm::mat4{1}, glm::vec3{finalPos, 0});
            const auto modelMatrix = sprTrans * sprScale;

            const auto& sprites = mSpriteManager.GetSpriteSheet(di.mSpriteSheet);
            const auto object = di.mDrawMode == DrawMode::Sprite
                ? sprites.Get(di.mTexture)
                : sprites.GetRect();
                
            Draw(
                modelMatrix,
                di.mColorMode,
                di.mColor,
                di.mTexture,
                object);
        }

        for (auto* elem : element->GetChildren())
            RenderGuiImpl(
                pi.mChildrenRelative
                    ? finalPos
                    : translate,
                elem);

        if (di.mDrawMode == DrawMode::ClipRegion)
            mCamera.DisableScissor();
    }

    void Draw(
        const glm::mat4& modelMatrix,
        ColorMode colorMode,
        const glm::vec4& blockColor,
        TextureIndex texture,
        std::tuple<unsigned, unsigned> object)
    {
        mCamera.UpdateModelViewMatrix(modelMatrix);

        mShader.SetUniform(mColorModeId, static_cast<unsigned>(colorMode));
        mShader.SetUniform(mBlockColorId, blockColor);
        
        const auto [offset, length] = object;

        glDrawElementsBaseVertex(
            GL_TRIANGLES,
            length,
            GL_UNSIGNED_INT,
            (void*) (offset * sizeof(GLuint)),
            offset
        );
    }

private:
    ShaderProgramHandle mShader;
    SpriteManager& mSpriteManager;

    glm::vec3 mDimensions;
    GuiCamera mCamera;

    // These are straight from the shader...
    GLuint mBlockColorId;
    GLuint mColorModeId;

    unsigned mRenderCalls;

    const Logging::Logger& mLogger;
};

}
