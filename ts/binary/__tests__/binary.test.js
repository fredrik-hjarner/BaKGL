import { getUint8, getUint16LE, getUint32LE } from '../binary.ts';

describe('binary utils', () => {
  describe('getUint8', () => {
    const validCases = [
      { input: [0], expected: 0 },
      { input: [255], expected: 255 },
      { input: [127], expected: 127 },
      { input: [128], expected: 128 },
    ];

    for (const testCase of validCases) {
      test(`should read [${testCase.input.join(', ')}] as ${testCase.expected}`, () => {
        const array = new Uint8Array(testCase.input);
        expect(getUint8(array, 0)).toBe(testCase.expected);
      });
    }

    test('should handle reading from different indices', () => {
      const array = new Uint8Array([1, 2, 3, 4]);
      expect(getUint8(array, 0)).toBe(1);
      expect(getUint8(array, 1)).toBe(2);
      expect(getUint8(array, 2)).toBe(3);
      expect(getUint8(array, 3)).toBe(4);
    });

    test('should throw on invalid inputs', () => {
      const array = new Uint8Array([0]);
      // @ts-expect-error: Testing runtime check
      expect(() => getUint8(undefined, 0)).toThrow('uint8Array is undefined');
      // @ts-expect-error: Testing runtime check
      expect(() => getUint8(array, undefined)).toThrow('index is undefined');
      expect(() => getUint8(array, 1)).toThrow('out of bounds');
      expect(() => getUint8(array, -1)).toThrow('index: -1 cannot be negative');
    });
  });

  describe('getUint16LE', () => {
    const validCases = [
      { input: [0, 0], expected: 0 },
      { input: [255, 255], expected: 65535 },
      { input: [52, 18], expected: 4660 },  // Note LE order
      { input: [255, 127], expected: 32767 },
      { input: [0, 128], expected: 32768 },
    ];

    for (const testCase of validCases) {
      test(`should read [${testCase.input.join(', ')}] as ${testCase.expected}`, () => {
        const array = new Uint8Array(testCase.input);
        expect(getUint16LE(array, 0)).toBe(testCase.expected);
      });
    }

    test('should handle reading from different indices', () => {
      const array = new Uint8Array([17, 34, 51, 68, 85, 102]);
      expect(getUint16LE(array, 0)).toBe(8721);  // 17 + (34 << 8)
      expect(getUint16LE(array, 2)).toBe(17459); // 51 + (68 << 8)
      expect(getUint16LE(array, 4)).toBe(26197); // 85 + (102 << 8)
    });

    test('should throw on invalid inputs', () => {
      const array = new Uint8Array([0, 0]);
      // @ts-expect-error: Testing runtime check
      expect(() => getUint16LE(undefined, 0)).toThrow('uint8Array is undefined');
      // @ts-expect-error: Testing runtime check
      expect(() => getUint16LE(array, undefined)).toThrow('index is undefined');
      expect(() => getUint16LE(array, 1)).toThrow('out of bounds');
      expect(() => getUint16LE(array, -1)).toThrow('index: -1 cannot be negative');
    });
  });

  describe('getUint32LE', () => {
    const validCases = [
      { input: [0, 0, 0, 0], expected: 0 },
      { input: [255, 255, 255, 255], expected: 4294967295 },
      // 120 + (86 * 2 ** 8) + (52 * 2 ** 16) + (18 * 2 ** 24) = 305419896
      { input: [120, 86, 52, 18], expected: 305419896 },  // Note LE order
      { input: [255, 255, 255, 127], expected: 2147483647 },
      { input: [0, 0, 0, 128], expected: 2147483648 },
    ];

    for (const testCase of validCases) {
      test(`should read [${testCase.input.join(', ')}] as ${testCase.expected}`, () => {
        const array = new Uint8Array(testCase.input);
        expect(getUint32LE(array, 0)).toBe(testCase.expected);
      });
    }

    test('should handle reading from different indices', () => {
      const array = new Uint8Array([
        17, 34, 51, 68,
        85, 102, 119, 136,
      ]);
      // 17 + (34 * 2 ** 8) + (51 * 2 ** 16) + (68 * 2 ** 24)  = 1144201745
      expect(getUint32LE(array, 0)).toBe(1144201745);
      // 85 + (102 * 2 ** 8) + (119 * 2 ** 16) + (136 * 2 ** 24) = 2289526357
      expect(getUint32LE(array, 4)).toBe(2289526357);
    });

    test('should throw on invalid inputs', () => {
      const array = new Uint8Array([0, 0, 0, 0]);
      // @ts-expect-error: Testing runtime check
      expect(() => getUint32LE(undefined, 0)).toThrow('uint8Array is undefined');
      // @ts-expect-error: Testing runtime check
      expect(() => getUint32LE(array, undefined)).toThrow('index is undefined');
      expect(() => getUint32LE(array, 1)).toThrow('out of bounds');
      expect(() => getUint32LE(array, -1)).toThrow('index: -1 cannot be negative');
    });
  });
});
