// Extend the globalThis interface to include the double function
// declare global {
//     interface Global {
//         double: (x: number) => number;
//     }
// }

globalThis.double = function(x: number) {
    return x * 2;
}

globalThis.add = function(x: number, y: number) {
    return x + y;
}