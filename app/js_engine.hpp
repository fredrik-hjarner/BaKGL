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
    JSValue loaded_module; // Store the evaluated module

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
        loaded_module = JS_Eval(ctx, 
                              js_code.c_str(), 
                              js_code.length(),
                              "", 
                              JS_EVAL_TYPE_MODULE);
        
        if (JS_IsException(loaded_module)) {
            throw std::runtime_error("Failed to evaluate JS code");
        }
    }

    ~JSEngine() {
        JS_FreeValue(ctx, loaded_module);
        JS_FreeContext(ctx);
        JS_FreeRuntime(rt);
    }

    // first int is arg type, second is return type
    int32_t call_int_int(const char* function_name, int32_t arg) {
        // Get the function from global scope
        JSValue global = JS_GetGlobalObject(ctx);
        JSValue fn = JS_GetPropertyStr(ctx, global, function_name);
        
        if (!JS_IsFunction(ctx, fn)) {
            JS_FreeValue(ctx, fn);
            JS_FreeValue(ctx, global);
            throw std::runtime_error("Function not found");
        }
        // Call it
        JSValue arg_val = JS_NewInt32(ctx, arg);
        JSValue ret = JS_Call(ctx, fn, global, 1, &arg_val);
        int32_t result;
        JS_ToInt32(ctx, &result, ret);
        
        // Cleanup
        JS_FreeValue(ctx, arg_val);
        JS_FreeValue(ctx, fn);
        JS_FreeValue(ctx, global);
        return result;
    }

    // int2 means arguments are two ints, second arg is return type
    int32_t call_int2_int(const char* function_name, int32_t arg1, int32_t arg2) {
        // Get the function from global scope
        JSValue global = JS_GetGlobalObject(ctx);
        JSValue fn = JS_GetPropertyStr(ctx, global, function_name);
        
        if (!JS_IsFunction(ctx, fn)) {
            JS_FreeValue(ctx, fn);
            JS_FreeValue(ctx, global);
            throw std::runtime_error("Function not found");
        }

        // Create array of arguments
        JSValue args[2];
        args[0] = JS_NewInt32(ctx, arg1);
        args[1] = JS_NewInt32(ctx, arg2);
        
        // Call the function with both arguments
        JSValue ret = JS_Call(ctx, fn, global, 2, args);
        
        int32_t result;
        JS_ToInt32(ctx, &result, ret);
        
        // Cleanup
        JS_FreeValue(ctx, args[0]);
        JS_FreeValue(ctx, args[1]);
        JS_FreeValue(ctx, ret);
        JS_FreeValue(ctx, fn);
        JS_FreeValue(ctx, global);
        
        return result;
    }

    // Function that takes in any c++ function that takes the global object as an argument and returns a JSValue.
    // template<typename Func>
    // auto with_function(const char* function_name, Func func) {
    //     // Get the function from global scope
    //     JSValue global = JS_GetGlobalObject(ctx);
    //     JSValue fn = JS_GetPropertyStr(ctx, global, function_name);
    //     if (!JS_IsFunction(ctx, fn)) {
    //         JS_FreeValue(ctx, fn);
    //         JS_FreeValue(ctx, global);
    //         throw std::runtime_error("Function not found");
    //     }
    //     // Call it with the given function
    //     auto ret = func(fn);
        
    //     JS_FreeValue(ctx, fn);
    //     JS_FreeValue(ctx, global);
    //     return ret;
    // }
};
