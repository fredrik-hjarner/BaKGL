## use zod to validate all inputs to functions

| Created | Resolved |
| ----- | --------|
| 2024-11-12 |  |

#### Description

I will need this to have some kind of safety when I call js functions from c++

#### Resolution



## examine if I can use eval to call functions more easily

| Created | Resolved |
| ----- | --------|
| 2024-11-12 | 2024-11-12 |

#### Description

#### Resolution

```cpp
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
```

```js
jsEngine.eval("double(2.2)")
jsEngine.eval("add(20, 0.2)")
```