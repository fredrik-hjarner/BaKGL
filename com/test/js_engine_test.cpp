#include "com/js_engine.hpp"
#include <gtest/gtest.h>

class JSEngineTest : public ::testing::Test {
protected:
    void SetUp() override {
        engine = std::make_unique<JSEngine>("test/js_engine_test.ts");
    }

    void TearDown() override {
        engine.reset();
    }

    std::unique_ptr<JSEngine> engine;
};

TEST_F(JSEngineTest, EvalNumber) {
    EXPECT_EQ(engine->eval<int32_t>("returnNumber()"), 42);
}

TEST_F(JSEngineTest, EvalString) {
    EXPECT_EQ(engine->eval<std::string>("returnString()"), "hello");
}

TEST_F(JSEngineTest, EvalBoolean) {
    EXPECT_EQ(engine->eval<bool>("returnBoolean()"), true);
}

TEST_F(JSEngineTest, EvalObject) {
    User user = engine->eval<User>("returnObject()");
    EXPECT_EQ(user.name, "Test User");
    EXPECT_EQ(user.age, 25);
}

TEST_F(JSEngineTest, EvalAdd) {
    EXPECT_EQ(engine->eval<int32_t>("add(40, 2)"), 42);
}

TEST_F(JSEngineTest, EvalConcatenate) {
    EXPECT_EQ(engine->eval<std::string>("concatenate('hello', ' world')"), "hello world");
}

TEST_F(JSEngineTest, EvalInvalidJS) {
    EXPECT_THROW(engine->eval<int32_t>("invalid_function()"), std::runtime_error);
}

TEST_F(JSEngineTest, EvalInvalidType) {
    EXPECT_THROW(engine->eval<int32_t>("returnString()"), std::runtime_error);
} 