function returnNumber() {
    return 42;
}

function returnString() {
    return "hello";
}

function returnBoolean() {
    return true;
}

function returnObject() {
    return {
        name: "Test User",
        age: 25
    };
}

function add(a: number, b: number) {
    return a + b;
}

function concatenate(a: string, b: string) {
    return a + b;
}

// Export to global scope
// @ts-expect-error
globalThis.returnNumber = returnNumber;
// @ts-expect-error
globalThis.returnString = returnString;
// @ts-expect-error
globalThis.returnBoolean = returnBoolean;
// @ts-expect-error
globalThis.returnObject = returnObject;
// @ts-expect-error
globalThis.add = add;
// @ts-expect-error
globalThis.concatenate = concatenate; 