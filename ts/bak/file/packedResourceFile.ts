// I'm fine with side effects right now. but maybe should change later.
import { FileBuffer } from "./fileBuffer.ts";
import { gameDataPath } from "../../consts.ts";

interface PackedResourceFile {
    majorVersion: number;
    minorVersion: number;
    packedResourceName: string;
    resourceIndexData: {
        hashKey: number;
        offset: number;
    }[];
}

const krondorRmfPath = `${gameDataPath}/krondor.rmf`;

const fileBuffer = await FileBuffer.createFromFile(krondorRmfPath);

const rmfMajorVersion = fileBuffer.getUint32LE();
const rmfMinorVersion = fileBuffer.getUint16LE();
// trim I hope removes /0s that are there if name < 13 chars.
const packedResourceName = fileBuffer.getString(13).trim();
const numPackedResources = fileBuffer.getUint16LE();

const resourceIndexData: PackedResourceFile["resourceIndexData"] = [];

for (let i = 0; i < numPackedResources; i++) {
  const hashKey: number = fileBuffer.getUint32LE();
  const offset: number = fileBuffer.getUint32LE();
  resourceIndexData.push({ hashKey, offset });
}

export const packedResourceFile: PackedResourceFile = {
    majorVersion: rmfMajorVersion,
    minorVersion: rmfMinorVersion,
    packedResourceName,
    resourceIndexData
}

console.log(JSON.stringify(packedResourceFile, null, 2));