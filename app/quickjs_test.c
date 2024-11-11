#include <stdio.h>
#include "quickjs.h"

int main() {
    JSRuntime *rt = JS_NewRuntime();
    if (!rt) {
        printf("Failed to create JS runtime\n");
        return 1;
    }

    printf("QuickJS runtime created successfully!\n");
    JS_FreeRuntime(rt);
    return 0;
} 