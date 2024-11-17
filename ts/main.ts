// import './bak/file/packedFileProvider.ts';
// import './bak/fmap.ts';
import { loadImages } from './bak/imageStore.ts';
import { extractPalettesToJson } from './bak/palette.ts';

extractPalettesToJson();

// BICONS1.BMX uses OPTIONS.PAL palette
loadImages('BICONS1.BMX');
