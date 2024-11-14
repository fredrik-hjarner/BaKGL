function double(x: number) {
    return x * 2;
}

function add(x: number, y: number) {
    return x + y;
}

function getUser() {
    return {
        name: "John",
        age: 30
    };
}


// @ts-expect-error
globalThis.double = double;
// @ts-expect-error
globalThis.add = add;
// @ts-expect-error
globalThis.getUser = getUser;