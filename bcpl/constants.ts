export const TRUE = 0xffff_ffff;
export const FALSE = 0x0000_0000;
export const booleanToConstant = (b: boolean) => (b ? TRUE : FALSE);

export const STATIC_ADDRESS_SPACE = 0xffff_0000;
export const GLOBAL_ADDRESS_SPACE = 0xfff0_0000;
export const STRINGS_ADDRESS_SPACE = 0xff00_0000;
export const LOCAL_ADDRESS_SPACE = 0x0000_0000;
