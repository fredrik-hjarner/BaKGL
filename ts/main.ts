// import './bak/file/packedFileProvider.ts';
// import './bak/fmap.ts';
import { extractPalettesToJson } from './bak/palette.ts';
import { experiment } from './step1-extract-resrouces/bmx.ts';
import { experimentScx } from './step1-extract-resrouces/scx.ts';

await extractPalettesToJson();
await experiment();
await experimentScx();
