import type { Image } from '../bak/image.ts';
import { loadImages } from '../bak/imageStore.ts';
import { BmpWriter } from '../bmp.ts';
import { loadPalette, type Palette } from './pal.ts';
import { extractedDataPath } from '../consts.ts';

const actors = [
    { imageFileName: "ACT001.BMX", paletteFileName: "ACT001.PAL" },
    { imageFileName: "ACT001A.BMX", paletteFileName: "ACT001.PAL" },
    { imageFileName: "ACT002.BMX", paletteFileName: "ACT002.PAL" },
    { imageFileName: "ACT002A.BMX", paletteFileName: "ACT002.PAL" },
    { imageFileName: "ACT003.BMX", paletteFileName: "ACT003.PAL" },
    { imageFileName: "ACT003A.BMX", paletteFileName: "ACT003.PAL" },
    { imageFileName: "ACT004.BMX", paletteFileName: "ACT004.PAL" },
    { imageFileName: "ACT004A.BMX", paletteFileName: "ACT004.PAL" },
    { imageFileName: "ACT005.BMX", paletteFileName: "ACT005.PAL" },
    { imageFileName: "ACT005A.BMX", paletteFileName: "ACT005.PAL" },
    { imageFileName: "ACT006.BMX", paletteFileName: "ACT006.PAL" },
    { imageFileName: "ACT006A.BMX", paletteFileName: "ACT006.PAL" },
    { imageFileName: "ACT007.BMX", paletteFileName: "ACT007.PAL" },
    { imageFileName: "ACT008.BMX", paletteFileName: "ACT008.PAL" },
    { imageFileName: "ACT009A.BMX", paletteFileName: "ACT009.PAL" },
    { imageFileName: "ACT010.BMX", paletteFileName: "ACT010.PAL" },
    { imageFileName: "ACT011.BMX", paletteFileName: "ACT011.PAL" },
    { imageFileName: "ACT012A.BMX", paletteFileName: "ACT012.PAL" },
    { imageFileName: "ACT013.BMX", paletteFileName: "ACT013.PAL" },
    { imageFileName: "ACT014.BMX", paletteFileName: "ACT014.PAL" },
    { imageFileName: "ACT015.BMX", paletteFileName: "ACT015.PAL" },
    { imageFileName: "ACT016.BMX", paletteFileName: "ACT016.PAL" },
    { imageFileName: "ACT017.BMX", paletteFileName: "ACT017.PAL" },
    { imageFileName: "ACT018A.BMX", paletteFileName: "ACT018.PAL" },
    { imageFileName: "ACT019.BMX", paletteFileName: "ACT019.PAL" },
    { imageFileName: "ACT020.BMX", paletteFileName: "ACT020.PAL" },
    { imageFileName: "ACT021.BMX", paletteFileName: "ACT021.PAL" },
    { imageFileName: "ACT022.BMX", paletteFileName: "ACT022.PAL" },
    { imageFileName: "ACT023.BMX", paletteFileName: "ACT023.PAL" },
    { imageFileName: "ACT024.BMX", paletteFileName: "ACT024.PAL" },
    { imageFileName: "ACT025.BMX", paletteFileName: "ACT025.PAL" },
    { imageFileName: "ACT026.BMX", paletteFileName: "ACT026.PAL" },
    { imageFileName: "ACT027.BMX", paletteFileName: "ACT027.PAL" },
    { imageFileName: "ACT028.BMX", paletteFileName: "ACT028.PAL" },
    { imageFileName: "ACT029.BMX", paletteFileName: "ACT029.PAL" },
    { imageFileName: "ACT030A.BMX", paletteFileName: "ACT030.PAL" },
    { imageFileName: "ACT031.BMX", paletteFileName: "ACT031.PAL" },
    { imageFileName: "ACT032.BMX", paletteFileName: "ACT032.PAL" },
    { imageFileName: "ACT033.BMX", paletteFileName: "ACT033.PAL" },
    { imageFileName: "ACT034.BMX", paletteFileName: "ACT034.PAL" },
    { imageFileName: "ACT035.BMX", paletteFileName: "ACT035.PAL" },
    { imageFileName: "ACT036.BMX", paletteFileName: "ACT036.PAL" },
    { imageFileName: "ACT037.BMX", paletteFileName: "ACT037.PAL" },
    { imageFileName: "ACT038.BMX", paletteFileName: "ACT038.PAL" },
    { imageFileName: "ACT039.BMX", paletteFileName: "ACT039.PAL" },
    { imageFileName: "ACT040.BMX", paletteFileName: "ACT040.PAL" },
    { imageFileName: "ACT041.BMX", paletteFileName: "ACT041.PAL" },
    { imageFileName: "ACT042.BMX", paletteFileName: "ACT042.PAL" },
    { imageFileName: "ACT043.BMX", paletteFileName: "ACT043.PAL" },
    { imageFileName: "ACT044.BMX", paletteFileName: "ACT044.PAL" },
    { imageFileName: "ACT045.BMX", paletteFileName: "ACT045.PAL" },
    { imageFileName: "ACT046.BMX", paletteFileName: "ACT046.PAL" },
    { imageFileName: "ACT047.BMX", paletteFileName: "ACT047.PAL" },
    { imageFileName: "ACT048.BMX", paletteFileName: "ACT048.PAL" },
    { imageFileName: "ACT049.BMX", paletteFileName: "ACT049.PAL" },
    { imageFileName: "ACT050.BMX", paletteFileName: "ACT050.PAL" },
    { imageFileName: "ACT051.BMX", paletteFileName: "ACT051.PAL" },
    { imageFileName: "ACT052.BMX", paletteFileName: "ACT052.PAL" },
    { imageFileName: "ACT053.BMX", paletteFileName: "ACT053.PAL" },
];

const chapters = [
    { imageFileName: 'C11A1.BMX', paletteFileName: 'C11A.PAL' },
    { imageFileName: 'C11A2.BMX', paletteFileName: 'C11A.PAL' },
    { imageFileName: 'C11B.BMX', paletteFileName: 'C11B.PAL' },
    { imageFileName: 'C12A.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_BAK.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_MAG.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12A_PUG.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C12B_ARC.BMX', paletteFileName: 'C12B.PAL' },
    { imageFileName: 'C12B_GOR.BMX', paletteFileName: 'C12B.PAL' },
    { imageFileName: 'C12B_SRL.BMX', paletteFileName: 'C12A.PAL' },
    { imageFileName: 'C21A.BMX', paletteFileName: 'C21.PAL' },
    { imageFileName: 'C21A_BAK.BMX', paletteFileName: 'C21.PAL' },
    { imageFileName: 'C21B1.BMX', paletteFileName: 'C21.PAL' },
    { imageFileName: 'C21C.BMX', paletteFileName: 'C21.PAL' },
    { imageFileName: 'C21_MAK.BMX', paletteFileName: 'C21.PAL' },
    { imageFileName: 'C22.BMX', paletteFileName: 'C22.PAL' },
    { imageFileName: 'C31A_BAK.BMX', paletteFileName: 'C31.PAL' },
    { imageFileName: 'C31A_JIM.BMX', paletteFileName: 'C31.PAL' },
    { imageFileName: 'C31A_PYR.BMX', paletteFileName: 'C31.PAL' },
    { imageFileName: 'C31B_BAK.BMX', paletteFileName: 'C31.PAL' },
    { imageFileName: 'C31B_GOR.BMX', paletteFileName: 'C31.PAL' },
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
    { imageFileName: 'C42_PNTR.BMX', paletteFileName: 'C42.PAL' },
    { imageFileName: 'C42_WNDW.BMX', paletteFileName: 'C42.PAL' },
    { imageFileName: 'C51A_BAK.BMX', paletteFileName: 'C51.PAL' },
    { imageFileName: 'C51A_MOR.BMX', paletteFileName: 'C51.PAL' },
    { imageFileName: 'C51A_PTR.BMX', paletteFileName: 'C51.PAL' },
    { imageFileName: 'C51B_BAK.BMX', paletteFileName: 'C51.PAL' },
    { imageFileName: 'C51B_JNL.BMX', paletteFileName: 'C51.PAL' },
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
    { imageFileName: 'C61A_TLK.BMX', paletteFileName: 'C61B.PAL' },
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
    { imageFileName: 'C81.BMX', paletteFileName: 'C81.PAL' },
    { imageFileName: 'C82A.BMX', paletteFileName: 'C82A.PAL' },
    { imageFileName: 'C82A_CEL.BMX', paletteFileName: 'C82A.PAL' },
    { imageFileName: 'C82B.BMX', paletteFileName: 'C82B.PAL' },
    { imageFileName: 'C82B_GOR.BMX', paletteFileName: 'C82B.PAL' },
    { imageFileName: 'C82C.BMX', paletteFileName: 'C82C.PAL' },
    { imageFileName: 'C82C_GAM.BMX', paletteFileName: 'C82C.PAL' },
    { imageFileName: 'C91_BG.BMX', paletteFileName: 'C91.PAL' },
    { imageFileName: 'C91_GOR.BMX', paletteFileName: 'C91_GOR.PAL' },
    { imageFileName: 'C91_JIM.BMX', paletteFileName: 'C91_JIM.PAL' },
    { imageFileName: 'C91_PRTY.BMX', paletteFileName: 'C91.PAL' },
    { imageFileName: 'C91_PUG.BMX', paletteFileName: 'C91_PUG.PAL' },
    { imageFileName: 'C92.BMX', paletteFileName: 'C92.PAL' },
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
];

const shops = [
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
];

const taverns = [
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
];

const zones = [
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
]

// a function that write actors in the format {"ACT001", "ACT001.PAL"}, one such per line
const pairsToCppMap = async (pairs: { imageFileName: string, paletteFileName: string }[]) => {
    // remove the ones that have the same string before the dot
    // pairs = pairs.filter((pair) => pair.imageFileName.split('.')[0] !== pair.paletteFileName.split('.')[0]);
    const result = pairs.map((pair) => `{"${pair.imageFileName}", "${pair.paletteFileName}"},`).join("\n");
    await Bun.write("~/Desktop/actors2.json", result);
}
pairsToCppMap(chapters);


const imagePalettePairs = [
    /////////////////////////////
    // BMX with known palettes //
    /////////////////////////////

    // Actors
    ...actors,

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


    // Chapters
    ...chapters,

    // Shops
    ...shops,

    // SPI

    // SPL

    // Temple
    { imageFileName: 'TEMPLE.BMX', paletteFileName: 'TEMPLE.PAL' },

    // Teleport
    { imageFileName: 'TELEPORT.BMX', paletteFileName: 'TELEPORT.PAL' },

    // Taverns
    ...taverns,

    // Zones
    ...zones,

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
    for (const { imageFileName, paletteFileName } of imagePalettePairs) {
        const images = await loadImages(imageFileName);
        const palette = await loadPalette(paletteFileName);

        images.forEach((image, index) => {
            dumpBmp({ imagesFileName: imageFileName, image, palette, index });
        });
    }
    console.log();
    console.log('Finished!');
    console.log();
}

export const experiment = async () => {
    await dumpAllBmp(false);
}
