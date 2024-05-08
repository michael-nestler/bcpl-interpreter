export const TRUE = 0xffff_ffff;
export const FALSE = 0x0000_0000;
export const booleanToConstant = (b: boolean) => (b ? TRUE : FALSE);

export const WRITES_ADDRESS = 0xff89;
export const WRITEF_ADDRESS = 0xff94;
