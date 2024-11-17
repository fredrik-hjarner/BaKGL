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

## use zod to validate all inputs to functions

| Created | Resolved |
| ----- | --------|
| 2024-11-12 |  |

#### Description

I will need this to have some kind of safety when I call js functions from c++

#### Resolution

## Content pipeline with artifacts for each step

| Created | Resolved |
| ----- | --------|
| 2024-11-17 |  |

#### Description

I think I want an artifacts or /artifacts folder with subfolders step1, step2, step3, et cetera.
This would be where the different steps of the content pipeline dumps data. step1 has gameinput, though I could add a step0 that just grabs the relevant game files and dumps the unchanged into .artifacts/step0.
step{n} is where the output of step{n} is used as input to step{n+1}.
So example of a step might be to take .PAL files and extract then into nice json files, the step afterwards would have the .PAL files removed and instead "replaced" with the json filess so that the later steps can use the json files. Thus more and more of the original data is removed and replaced with the processed data.

#### Resolution

