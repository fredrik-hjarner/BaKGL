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

## Add quickjs in a better more elegant consistant way to the project

| Created | Resolved |
| ----- | --------|
| 2024-11-12 |  |

#### Description

Might be able to add it to the top-level CMakeLists.txt in a variable or something. The custom build by the side is not super elegant. Maybe it's possible to just use the FetchContent_Declare and MakeAvailable or something.

#### Resolution

## Add nlohmann_json in a better more elegant consistant way to the project

| Created | Resolved |
| ----- | --------|
| 2024-11-12 |  |

#### Description

```cpp
            ${QUICKJS_LIBS}
            nlohmann_json::nlohmann_json
        )
    else()
        target_link_libraries(${APP_BIN}
            ${LINK_UNIX_LIBRARIES}
            ${LINK_3D_LIBRARIES}
            #${SDL_LIBRARIES}
            ${APP_LIBS}
            nlohmann_json::nlohmann_json
        )
```

it could prolly be added to the top-level CMakeLists.txt in a variable or something.

#### Resolution

