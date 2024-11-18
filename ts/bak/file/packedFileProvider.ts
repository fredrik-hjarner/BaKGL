// I'm fine with side effects right now. but maybe should change later.
import { FileBuffer } from "./fileBuffer.ts";
import { packedResourceFile } from "./packedResourceFile.ts";
import { gameDataPath, extractedDataPath } from "../../consts.ts";

const packedResourcePath = `${gameDataPath}/${packedResourceFile.packedResourceName}`;
const packedResource = await FileBuffer.createFromFile(packedResourcePath);

const subBuffers: Map<string, FileBuffer> = new Map();

// Iterate over the resource index data and fetch the corresponding data from the packed resource file
for (const resource of packedResourceFile.resourceIndexData) {
  const { hashKey, offset } = resource;
  packedResource.jumpToIndex(offset);
  // trim I hope removes /0s that are there if name < 13 chars.
  const resourceName = packedResource.getString(13).trim();
  const resourceSize = packedResource.getUint32LE();
  const startOffset = offset + 13 + 4;
  const subBuffer = packedResource.makeSubBuffer(startOffset, resourceSize);
  subBuffers.set(resourceName, subBuffer);

  console.log(`Resource: ${resourceName} hash: ${hashKey.toString(16)} offset: ${offset} size: ${resourceSize}`);
}

export function dumpExtractedFilesToDisk() {
  for (const [resourceName, subBuffer] of subBuffers.entries()) {
    const path = `${extractedDataPath}/${resourceName}`;
    Bun.write(path, subBuffer.uint8Array);
  }
}

dumpExtractedFilesToDisk();