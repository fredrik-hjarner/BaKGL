export function getUint8(uint8Array: Uint8Array, index: number): number {
  // Assert that uint8Array and index are defined
  if (uint8Array === undefined) {
    throw new Error('getUint8: uint8Array is undefined');
  }
  if (index === undefined) {
    throw new Error('getUint8: index is undefined');
  }
  
  // check that the index is valid
  if (index < 0) {
    throw new Error(`getUint8: index: ${index} cannot be negative`);
  }
  if (index >= uint8Array.length) {
    throw new Error(`getUint8: index: ${index} is out of bounds for uint8Array of length: ${uint8Array.length}`);
  }

  const result: number = uint8Array[index];
  
  // Validate result is within uint8 bounds (0-255)
  if (result < 0 || result > 255) {
    throw new Error(`getUint8: value at index ${index} is outside valid uint8 range (0-255): ${result}`);
  }

  return result;
}

export function getUint16LE(uint8Array: Uint8Array, index: number): number {
  // Assert that uint8Array and index are defined
  if (uint8Array === undefined) {
    throw new Error('getUint16LE: uint8Array is undefined');
  }
  if (index === undefined) {
    throw new Error('getUint16LE: index is undefined');
  }
  
  // check that the index is valid
  if (index < 0) {
    throw new Error(`getUint16LE: index: ${index} cannot be negative`);
  }
  if (index + 1 >= uint8Array.length) {
    throw new Error(`getUint16LE: index: ${index} + 1 is out of bounds for uint8Array of length: ${uint8Array.length}`);
  }

  const result: number = uint8Array[index] | (uint8Array[index + 1] << 8);
  
  // Validate result is within uint16 bounds (0-65535)
  if (result < 0 || result > 65535) {
    throw new Error(`getUint16LE: value at index ${index} is outside valid uint16 range (0-65535): ${result}`);
  }

  return result;
}

export function getUint32LE(uint8Array: Uint8Array, index: number): number {
  // Assert that uint8Array and index are defined
  if (uint8Array === undefined) {
    throw new Error('getUint32LE: uint8Array is undefined');
  }
  if (index === undefined) {
    throw new Error('getUint32LE: index is undefined');
  }
  
  // check that the index is valid
  if (index < 0) {
    throw new Error(`getUint32LE: index: ${index} cannot be negative`);
  }
  if (index + 3 >= uint8Array.length) {
    throw new Error(`getUint32LE: index: ${index} + 3 is out of bounds for uint8Array of length: ${uint8Array.length}`);
  }

  const result: number = Math.round(
    uint8Array[index] +
    uint8Array[index + 1] * (2 ** 8) +
    uint8Array[index + 2] * (2 ** 16) +
    uint8Array[index + 3] * (2 ** 24)
  );
  
  // Validate result is within uint32 bounds (0-4294967295)
  if (result < 0 || result > 4294967295) {
    throw new Error(`getUint32LE: value at index ${index} is outside valid uint32 range (0-4294967295): ${result}`);
  }

  return result;
}
