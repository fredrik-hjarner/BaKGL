
function double(x: number) {
    return x * 2;
}

function add(x: number, y: number) {
    return x + y;
}

// @ts-expect-error
globalThis.double = double;
// @ts-expect-error
globalThis.add = add;