import type { Image } from '../bak/image.ts';
import { loadImages } from '../bak/imageStore.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette, type Palette } from './pal.ts';
import { extractedDataPath } from '../consts.ts';

// await extractPalettesToJson();

const scxPairs = [
    { imageFileName: 'BOOK.SCX', paletteFileName: 'BOOK.PAL' },
    { imageFileName: 'C42.SCX', paletteFileName: 'TELEPORT.PAL' },
    { imageFileName: 'CAST.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CFRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CONT2.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'CONTENTS.SCX', paletteFileName: 'CONTENTS.PAL' },
    { imageFileName: 'DIALOG.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'ENCAMP.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FRAME.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FULLMAP.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INT_BORD.SCX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'INVENTOR.SCX', paletteFileName: 'INVENTOR.PAL' },
    { imageFileName: 'OPTIONS0.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS1.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'OPTIONS2.SCX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'PUZZLE.SCX', paletteFileName: 'PUZZLE.PAL' },
    { imageFileName: 'RIFTMAP.SCX', paletteFileName: 'OPTIONS.PAL' },
]

// because there are so many ACT (ACTOR) files, we need a helper to create the pairs.
const actPairHelper = (actIndex: number, a: boolean = true, onlyA: boolean = false) => {
    const paddedIndex = actIndex.toString().padStart(3, '0');
    const result = [];
    if (!onlyA) {
        result.push({
            imageFileName: `ACT${paddedIndex}.BMX`,
            paletteFileName: `ACT${paddedIndex}.PAL`,
        });
    }
    if (a) {
        result.push({
            imageFileName: `ACT${paddedIndex}A.BMX`,
            paletteFileName: `ACT${paddedIndex}.PAL`,
        });
    }
    return result;
}

const imagePalettePairs = [
    /////////////////////////////
    // BMX with known palettes //
    /////////////////////////////
    { imageFileName: 'BICONS1.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'BICONS2.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'CASTFACE.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'COMPASS.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'ENCAMP.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'FMAP_ICN.BMX', paletteFileName: 'FULLMAP.PAL' },
    { imageFileName: 'HEADS.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVLOCK.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVMISC.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVSHP1.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'INVSHP2.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'POINTERG.BMX', paletteFileName: 'OPTIONS.PAL' },
    ...actPairHelper(1),
    ...actPairHelper(2),
    ...actPairHelper(3),
    ...actPairHelper(4),
    ...actPairHelper(5),
    ...actPairHelper(6),
    ...actPairHelper(7, false),
    ...actPairHelper(8, false),
    ...actPairHelper(9, true, true),
    ...actPairHelper(10, false),
    ...actPairHelper(11, false),
    ...actPairHelper(12, true, true),
    ...actPairHelper(13, false),
    ...actPairHelper(14, false),
    ...actPairHelper(15, false),
    ...actPairHelper(16, false),
    ...actPairHelper(17, false),
    ...actPairHelper(18, true, true),
    ...actPairHelper(19, false),
    ...actPairHelper(20, false),
    ...actPairHelper(21, false),
    ...actPairHelper(22, false),
    ...actPairHelper(23, false),
    ...actPairHelper(24, false),
    ...actPairHelper(25, false),
    ...actPairHelper(26, false),
    ...actPairHelper(27, false),
    ...actPairHelper(28, false),
    ...actPairHelper(29, false),
    ...actPairHelper(30, true, true),
    ...actPairHelper(31, false),
    ...actPairHelper(32, false),
    ...actPairHelper(33, false),
    ...actPairHelper(34, false),
    ...actPairHelper(35, false),
    ...actPairHelper(36, false),
    ...actPairHelper(37, false),
    ...actPairHelper(38, false),
    ...actPairHelper(39, false),
    ...actPairHelper(40, false),
    ...actPairHelper(41, false),
    ...actPairHelper(42, false),
    ...actPairHelper(43, false),
    ...actPairHelper(44, false),
    ...actPairHelper(45, false),
    ...actPairHelper(46, false),
    ...actPairHelper(47, false),
    ...actPairHelper(48, false),
    ...actPairHelper(49, false),
    ...actPairHelper(50, false),
    ...actPairHelper(51, false),
    ...actPairHelper(52, false),
    ...actPairHelper(53, false),

    // Chapters (CXX)
    { imageFileName: 'C11A1.BMX', paletteFileName: 'C11A.PAL' },
    { imageFileName: 'C11A2.BMX', paletteFileName: 'C11A.PAL' },
    { imageFileName: 'C11B.BMX', paletteFileName: 'C11B.PAL' },
    { imageFileName: 'C12A.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_BAK.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_MAG.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_PUG.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12B_ARC.BMX', paletteFileName: 'C12B.PAL' },
    { imageFileName: 'C12B_GOR.BMX', paletteFileName: 'C12B.PAL' },
    { imageFileName: 'C12B_SRL.BMX', paletteFileName: 'C12B.PAL' },
    // { imageFileName: 'C21A.BMX', paletteFileName: 'C21A.PAL' },
    // { imageFileName: 'C21A_BAK.BMX', paletteFileName: 'C21A.PAL' },
    // { imageFileName: 'C21B1.BMX', paletteFileName: 'C21B.PAL' },
    // { imageFileName: 'C21C.BMX', paletteFileName: 'C21C.PAL' },
    // { imageFileName: 'C21_MAK.BMX', paletteFileName: 'C21_.PAL' },
    // { imageFileName: 'C22.BMX', paletteFileName: 'C22..PAL' },
    // { imageFileName: 'C31A_BAK.BMX', paletteFileName: 'C31A.PAL' },
    // { imageFileName: 'C31A_JIM.BMX', paletteFileName: 'C31A.PAL' },
    // { imageFileName: 'C31A_PYR.BMX', paletteFileName: 'C31A.PAL' },
    // { imageFileName: 'C31B_BAK.BMX', paletteFileName: 'C31B.PAL' },
    // { imageFileName: 'C31B_GOR.BMX', paletteFileName: 'C31B.PAL' },
    { imageFileName: 'C32A_BAK.BMX', paletteFileName: 'C32A.PAL' },
    { imageFileName: 'C32A_WLK.BMX', paletteFileName: 'C32A.PAL' },
    { imageFileName: 'C32B_BAK.BMX', paletteFileName: 'C32B.PAL' },
    { imageFileName: 'C41A_BAK.BMX', paletteFileName: 'C41A.PAL' },
    { imageFileName: 'C41A_DEL.BMX', paletteFileName: 'C41A.PAL' },
    { imageFileName: 'C41A_DOR.BMX', paletteFileName: 'C41A.PAL' },
    { imageFileName: 'C41A_OWD.BMX', paletteFileName: 'C41A.PAL' },
    { imageFileName: 'C41A_OWO.BMX', paletteFileName: 'C41A.PAL' },
    { imageFileName: 'C41B_BAK.BMX', paletteFileName: 'C41B.PAL' },
    { imageFileName: 'C41B_DEL.BMX', paletteFileName: 'C41B.PAL' },
    { imageFileName: 'C41B_GOR.BMX', paletteFileName: 'C41B.PAL' },
    // { imageFileName: 'C42_PNTR.BMX', paletteFileName: 'C42_.PAL' },
    // { imageFileName: 'C42_WNDW.BMX', paletteFileName: 'C42_.PAL' },
    // { imageFileName: 'C51A_BAK.BMX', paletteFileName: 'C51A.PAL' },
    // { imageFileName: 'C51A_MOR.BMX', paletteFileName: 'C51A.PAL' },
    // { imageFileName: 'C51A_PTR.BMX', paletteFileName: 'C51A.PAL' },
    // { imageFileName: 'C51B_BAK.BMX', paletteFileName: 'C51B.PAL' },
    // { imageFileName: 'C51B_JNL.BMX', paletteFileName: 'C51B.PAL' },
    { imageFileName: 'C52A_BAK.BMX', paletteFileName: 'C52A.PAL' },
    { imageFileName: 'C52A_JIM.BMX', paletteFileName: 'C52A.PAL' },
    { imageFileName: 'C52A_MOR.BMX', paletteFileName: 'C52A.PAL' },
    { imageFileName: 'C52B_ARU.BMX', paletteFileName: 'C52B.PAL' },
    { imageFileName: 'C52B_BAK.BMX', paletteFileName: 'C52B.PAL' },
    { imageFileName: 'C52B_JIM.BMX', paletteFileName: 'C52B.PAL' },
    { imageFileName: 'C61A_BAK.BMX', paletteFileName: 'C61A.PAL' },
    { imageFileName: 'C61A_CHS.BMX', paletteFileName: 'C61A.PAL' },
    { imageFileName: 'C61A_GAT.BMX', paletteFileName: 'C61A.PAL' },
    { imageFileName: 'C61A_MAK.BMX', paletteFileName: 'C61A.PAL' },
    { imageFileName: 'C61A_TLK.BMX', paletteFileName: 'C61A.PAL' },
    { imageFileName: 'C61B_BAK.BMX', paletteFileName: 'C61B.PAL' },
    { imageFileName: 'C61B_MAK.BMX', paletteFileName: 'C61B.PAL' },
    { imageFileName: 'C61C_BAK.BMX', paletteFileName: 'C61C.PAL' },
    { imageFileName: 'C61C_PUG.BMX', paletteFileName: 'C61C.PAL' },
    { imageFileName: 'C61C_TLK.BMX', paletteFileName: 'C61C.PAL' },
    { imageFileName: 'C61D_BAK.BMX', paletteFileName: 'C61D.PAL' },
    { imageFileName: 'C61D_BLA.BMX', paletteFileName: 'C61D.PAL' },
    { imageFileName: 'C61D_MAC.BMX', paletteFileName: 'C61D.PAL' },
    { imageFileName: 'C62A.BMX', paletteFileName: 'C62A.PAL' },
    { imageFileName: 'C62B_BG1.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C62B_BG2.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C62B_BOK.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C62B_BRU.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C62B_QUE.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C62B_TOM.BMX', paletteFileName: 'C62B.PAL' },
    { imageFileName: 'C71A_AR1.BMX', paletteFileName: 'C71A.PAL' },
    { imageFileName: 'C71A_AR2.BMX', paletteFileName: 'C71A.PAL' },
    { imageFileName: 'C71A_BG.BMX', paletteFileName: 'C71A.PAL' },
    { imageFileName: 'C71B.BMX', paletteFileName: 'C71B.PAL' },
    { imageFileName: 'C71B_BG.BMX', paletteFileName: 'C71B.PAL' },
    { imageFileName: 'C71C.BMX', paletteFileName: 'C71C.PAL' },
    { imageFileName: 'C71C_BG.BMX', paletteFileName: 'C71C.PAL' },
    { imageFileName: 'C72A_BG.BMX', paletteFileName: 'C72A.PAL' },
    { imageFileName: 'C72A_LEA.BMX', paletteFileName: 'C72A.PAL' },
    { imageFileName: 'C72A_PAT.BMX', paletteFileName: 'C72A.PAL' },
    { imageFileName: 'C72B_BG.BMX', paletteFileName: 'C72B.PAL' },
    { imageFileName: 'C72B_HLD.BMX', paletteFileName: 'C72B.PAL' },
    { imageFileName: 'C72B_PAT.BMX', paletteFileName: 'C72B.PAL' },
    { imageFileName: 'C72C_BG.BMX', paletteFileName: 'C72C.PAL' },
    { imageFileName: 'C72C_PTY.BMX', paletteFileName: 'C72C.PAL' },
    // { imageFileName: 'C81.BMX', paletteFileName: 'C81..PAL' },
    { imageFileName: 'C82A.BMX', paletteFileName: 'C82A.PAL' },
    { imageFileName: 'C82A_CEL.BMX', paletteFileName: 'C82A.PAL' },
    { imageFileName: 'C82B.BMX', paletteFileName: 'C82B.PAL' },
    { imageFileName: 'C82B_GOR.BMX', paletteFileName: 'C82B.PAL' },
    { imageFileName: 'C82C.BMX', paletteFileName: 'C82C.PAL' },
    { imageFileName: 'C82C_GAM.BMX', paletteFileName: 'C82C.PAL' },
    // { imageFileName: 'C91_BG.BMX', paletteFileName: 'C91_.PAL' },
    // { imageFileName: 'C91_GOR.BMX', paletteFileName: 'C91_.PAL' },
    // { imageFileName: 'C91_JIM.BMX', paletteFileName: 'C91_.PAL' },
    // { imageFileName: 'C91_PRTY.BMX', paletteFileName: 'C91_.PAL' },
    // { imageFileName: 'C91_PUG.BMX', paletteFileName: 'C91_.PAL' },
    // { imageFileName: 'C92.BMX', paletteFileName: 'C92..PAL' },
    { imageFileName: 'C93A.BMX', paletteFileName: 'C93A.PAL' },
    { imageFileName: 'C93A_1.BMX', paletteFileName: 'C93A.PAL' },
    { imageFileName: 'C93B.BMX', paletteFileName: 'C93B.PAL' },
    { imageFileName: 'C93B_1.BMX', paletteFileName: 'C93B.PAL' },
    { imageFileName: 'C93B_2.BMX', paletteFileName: 'C93B.PAL' },
    { imageFileName: 'C93C.BMX', paletteFileName: 'C93C.PAL' },
    { imageFileName: 'C93C_1A.BMX', paletteFileName: 'C93C.PAL' },
    { imageFileName: 'C93C_1B.BMX', paletteFileName: 'C93C.PAL' },
    { imageFileName: 'C93C_1C.BMX', paletteFileName: 'C93C.PAL' },
    { imageFileName: 'C93D.BMX', paletteFileName: 'C93D.PAL' },
    { imageFileName: 'C93D_1.BMX', paletteFileName: 'C93D.PAL' },

    // Shops
    { imageFileName: 'SHOP1.BMX', paletteFileName: 'SHOP1.PAL' },
    { imageFileName: 'SHOP1ARM.BMX', paletteFileName: 'SHOP1.PAL' },
    { imageFileName: 'SHOP1BAK.BMX', paletteFileName: 'SHOP1.PAL' },
    { imageFileName: 'SHOP2.BMX', paletteFileName: 'SHOP2.PAL' },
    { imageFileName: 'SHOP2ARM.BMX', paletteFileName: 'SHOP2.PAL' },
    { imageFileName: 'SHOP2BAK.BMX', paletteFileName: 'SHOP2.PAL' },
    { imageFileName: 'SHOP3.BMX', paletteFileName: 'SHOP3.PAL' },
    { imageFileName: 'SHOP3ARM.BMX', paletteFileName: 'SHOP3.PAL' },
    { imageFileName: 'SHOP3BAK.BMX', paletteFileName: 'SHOP3.PAL' },
    { imageFileName: 'SHOP4.BMX', paletteFileName: 'SHOP4.PAL' },
    
    // SPI
    
    // SPL
    
    // Temple
    { imageFileName: 'TEMPLE.BMX', paletteFileName: 'TEMPLE.PAL' },

    // Teleport
    { imageFileName: 'TELEPORT.BMX', paletteFileName: 'TELEPORT.PAL' },
    
    // Taverns
    { imageFileName: 'TVRN1.BMX', paletteFileName: 'TVRN1.PAL' },
    { imageFileName: 'TVRN1BAK.BMX', paletteFileName: 'TVRN1.PAL' },
    { imageFileName: 'TVRN1PPL.BMX', paletteFileName: 'TVRN1.PAL' },
    { imageFileName: 'TVRN2.BMX', paletteFileName: 'TVRN2.PAL' },
    { imageFileName: 'TVRN2BAK.BMX', paletteFileName: 'TVRN2.PAL' },
    { imageFileName: 'TVRN2PPL.BMX', paletteFileName: 'TVRN2.PAL' },
    { imageFileName: 'TVRN3.BMX', paletteFileName: 'TVRN3.PAL' },
    { imageFileName: 'TVRN3BAK.BMX', paletteFileName: 'TVRN3.PAL' },
    { imageFileName: 'TVRN3PPL.BMX', paletteFileName: 'TVRN3.PAL' },
    { imageFileName: 'TVRN4.BMX', paletteFileName: 'TVRN4.PAL' },
    { imageFileName: 'TVRN4BAK.BMX', paletteFileName: 'TVRN4.PAL' },
    { imageFileName: 'TVRN4PPL.BMX', paletteFileName: 'TVRN4.PAL' },
    { imageFileName: 'TVRN5.BMX', paletteFileName: 'TVRN5.PAL' },
    { imageFileName: 'TVRN5BAK.BMX', paletteFileName: 'TVRN5.PAL' },
    { imageFileName: 'TVRN5PPL.BMX', paletteFileName: 'TVRN5.PAL' },

    // Zones
    { imageFileName: 'Z01H.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z01SLOT0.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z01SLOT1.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z01SLOT2.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z01SLOT3.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z01SLOT4.BMX', paletteFileName: 'Z01.PAL' },
    { imageFileName: 'Z02H.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z02SLOT0.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z02SLOT1.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z02SLOT2.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z02SLOT3.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z02SLOT4.BMX', paletteFileName: 'Z02.PAL' },
    { imageFileName: 'Z03H.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z03SLOT0.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z03SLOT1.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z03SLOT2.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z03SLOT3.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z03SLOT4.BMX', paletteFileName: 'Z03.PAL' },
    { imageFileName: 'Z04H.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z04SLOT0.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z04SLOT1.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z04SLOT2.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z04SLOT3.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z04SLOT4.BMX', paletteFileName: 'Z04.PAL' },
    { imageFileName: 'Z05H.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z05SLOT0.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z05SLOT1.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z05SLOT2.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z05SLOT3.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z05SLOT4.BMX', paletteFileName: 'Z05.PAL' },
    { imageFileName: 'Z06H.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z06SLOT0.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z06SLOT1.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z06SLOT2.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z06SLOT3.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z06SLOT4.BMX', paletteFileName: 'Z06.PAL' },
    { imageFileName: 'Z07H.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z07SLOT0.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z07SLOT1.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z07SLOT2.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z07SLOT3.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z07SLOT4.BMX', paletteFileName: 'Z07.PAL' },
    { imageFileName: 'Z08SLOT0.BMX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z08SLOT1.BMX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z08SLOT2.BMX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z08SLOT3.BMX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z08SLOT4.BMX', paletteFileName: 'Z08.PAL' },
    { imageFileName: 'Z09SLOT0.BMX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z09SLOT1.BMX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z09SLOT2.BMX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z09SLOT3.BMX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z09SLOT4.BMX', paletteFileName: 'Z09.PAL' },
    { imageFileName: 'Z10SLOT0.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z10SLOT1.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z10SLOT2.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z10SLOT3.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z10SLOT4.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z10SLOT5.BMX', paletteFileName: 'Z10.PAL' },
    { imageFileName: 'Z11SLOT0.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT1.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT2.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT3.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT4.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT5.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z11SLOT6.BMX', paletteFileName: 'Z11.PAL' },
    { imageFileName: 'Z12SLOT0.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT1.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT2.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT3.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT4.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT5.BMX', paletteFileName: 'Z12.PAL' },
    { imageFileName: 'Z12SLOT6.BMX', paletteFileName: 'Z12.PAL' },

    ///////////////////////////////
    // BMX with unknown palettes //
    ///////////////////////////////

    { imageFileName: 'BOOK.BMX', paletteFileName: 'BOOK.PAL' }, // book must have book palette, right?
    { imageFileName: 'BOOM.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'BRK1.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'BRK2.BMX', paletteFileName: 'OPTIONS.PAL' },
    { imageFileName: 'BRK3.BMX', paletteFileName: 'OPTIONS.PAL' },
    // { imageFileName: 'C12B_ARC.BMX', paletteFileName: 'OPTIONS.PAL' },
];

type DumpBmpParams = {
    imagesFileName: string;
    image: Image;
    palette: Palette;
    index: number;
}

const dumpBmp = ({ imagesFileName, image, palette, index }: DumpBmpParams) => {
    const imageWithColors = Array.from(image.pixels).flatMap((paletteIndex) => {
        const color = palette.colors[paletteIndex];
        return [color.r, color.g, color.b];
    });
    // console.log({imageWithColors});
    
    // now use BmpWriter to write to file
    const bmp = BmpWriter.createBmpArray(image.width, image.height, Uint8Array.from(imageWithColors));
    Bun.write(`${extractedDataPath}/step2/BMX/${imagesFileName.replace('.BMX', '')}_${index}.BMX.bmp`, bmp);
}

const dumpAllBmp = async (cleanFirst: boolean = false) => {
    if (cleanFirst) {
        throw new Error('Not implemented');
    }
    for (const {imageFileName, paletteFileName} of imagePalettePairs) {
        const images = await loadImages(imageFileName);
        const palette = await loadPalette(paletteFileName);

        images.forEach((image, index) => {
            dumpBmp({imagesFileName: imageFileName, image, palette, index});
        });
    }
}

export const experiment = async () => {
    await dumpAllBmp(false);
}
