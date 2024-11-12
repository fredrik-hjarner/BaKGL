#pragma once

#include <stdexcept>
#include <string>
#include <cstdio>
#include <functional>
#include "quickjs/quickjs.hpp"
#include "com/logger.hpp"

class JSEngine {
private:
    JSRuntime* rt;
    JSContext* ctx;
    // All js is loaded into this JSValue. To get functions out of it
    // you can grab globals (on globalThis). Dunno if exports can be grabbed too...?

    std::string build_typescript() {
        // TODO: Should read some main.ts or index.ts file or something in some folder somewhere.
        FILE* pipe = popen("bun build ../app/main.ts", "r");
        if (!pipe) throw std::runtime_error("Failed to run bun build");
        
        std::string result;
        char buffer[128];
        while (fgets(buffer, sizeof(buffer), pipe) != nullptr) {
            result += buffer;
        }
        pclose(pipe);
        auto logger = Logging::LogState::GetLogger("JSEngine");
        logger.Info() << "JSEngine: build_typescript: " << result << "\n";
        return result;
    }

public:
    JSEngine() {
        rt = JS_NewRuntime();
        ctx = JS_NewContext(rt);
        if (!rt || !ctx) throw std::runtime_error("JS init failed");
        // Load TypeScript code at startup
        std::string js_code = build_typescript();
        JSValue loaded_module = JS_Eval(ctx, 
                              js_code.c_str(), 
                              js_code.length(),
                              "", 
                              JS_EVAL_TYPE_GLOBAL);
        
        if (JS_IsException(loaded_module)) {
            throw std::runtime_error("Failed to evaluate JS code");
        }
        JS_FreeValue(ctx, loaded_module);
    }

    ~JSEngine() {
        JS_FreeContext(ctx);
        JS_FreeRuntime(rt);
    }

    double eval(const char* expr) {
        JSValue result = JS_Eval(ctx,
                                expr,
                                strlen(expr),
                                "<eval>",
                                JS_EVAL_TYPE_GLOBAL);
        
        if (JS_IsException(result)) {
            JS_FreeValue(ctx, result);
            throw std::runtime_error("Failed to execute function");
        }
        
        double cpp_result;
        JS_ToFloat64(ctx, &cpp_result, result);
        JS_FreeValue(ctx, result);
        
        return cpp_result;
    }
};
