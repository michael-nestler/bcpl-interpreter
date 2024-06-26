export const TRUE = 0xffff_ffff;
export const FALSE = 0x0000_0000;
export const booleanToConstant = (b: boolean) => (b ? TRUE : FALSE);

export const STATIC_ADDRESS_SPACE = 0x03f0_0000;
export const GLOBAL_ADDRESS_SPACE = 0x03e0_0000;
export const STRINGS_ADDRESS_SPACE = 0x03c0_0000;
export const LOCAL_ADDRESS_SPACE = 0x0000_0000;

export const RESULT2_GLOBAL_INDEX = 10;

export const STACK_SIZE = 64 * 1024 * 1024; // 256 MiB
