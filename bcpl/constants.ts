export const TRUE = 0xffff;
export const FALSE = 0x0000;
export const booleanToConstant = (b: boolean) => (b ? TRUE : FALSE);

export const WRITEF_ADDRESS = 0xff74;
