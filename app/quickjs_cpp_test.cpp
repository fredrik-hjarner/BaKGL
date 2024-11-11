#include <iostream>
#include <cstring>

// Disable ALL warnings for QuickJS includes
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wall"
#pragma GCC diagnostic ignored "-Wextra"
#pragma GCC diagnostic ignored "-Wpedantic"
#pragma GCC diagnostic ignored "-Wcast-function-type"
extern "C" {
#include "quickjs.h"
}
#pragma GCC diagnostic pop

int main() {
    JSRuntime *rt = JS_NewRuntime();
    if (!rt) {
        std::cout << "Failed to create JS runtime\n";
        return 1;
    }

    JSContext *ctx = JS_NewContext(rt);
    if (!ctx) {
        std::cout << "Failed to create JS context\n";
        JS_FreeRuntime(rt);
        return 1;
    }

    // Try to evaluate a simple JS expression
    const char *expr = "40 + 2";
    JSValue val = JS_Eval(ctx, expr, strlen(expr), "<input>", JS_EVAL_TYPE_GLOBAL);
    
    if (JS_IsException(val)) {
        std::cout << "JS evaluation failed\n";
    } else {
        int32_t result;
        JS_ToInt32(ctx, &result, val);
        std::cout << "JS Result: " << result << "\n";
    }

    JS_FreeValue(ctx, val);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);
    return 0;
} 