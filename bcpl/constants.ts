export const TRUE = 0xffff_ffff;
export const FALSE = 0x0000_0000;
export const booleanToConstant = (b: boolean) => (b ? TRUE : FALSE);

export const RDARGS_ADDRESS = 0xff00 + 102;

export const STATIC_ADDRESS_SPACE = 0xffff_0000;
export const LOCAL_ADDRESS_SPACE = 0x0000_0000;
