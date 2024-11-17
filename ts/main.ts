// import './bak/file/packedFileProvider.ts';
// import './bak/fmap.ts';
import { extractPalettesToJson } from './bak/palette.ts';
import { experiment } from './step1-extract-resrouces/bmx.ts';

await extractPalettesToJson();

await experiment();
