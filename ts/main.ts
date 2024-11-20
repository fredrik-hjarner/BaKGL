// import './bak/file/packedFileProvider.ts'; // uncomment this to export unpack krondor.001
// import './bak/fmap.ts';
import { extractPalettesToJson } from './bak/palette.ts';
import { deleteAllAlreadyExtractedBmx, experiment } from './step1-extract-resrouces/bmx.ts';
import { experimentScx } from './step1-extract-resrouces/scx.ts';

await extractPalettesToJson();
await experiment();
await experimentScx();

// deleteAllAlreadyExtractedBmx();
    