export const operations = {
  TRUE: 4,
  FALSE: 5,
  RV: 8,
  FNAP: 10,
  MULT: 11,
  DIV: 12,
  REM: 13,
  PLUS: 14,
  ADD: 14,
  MINUS: 15,
  SUB: 15,
  QUERY: 16,
  NEG: 17,
  ABS: 19,
  EQ: 20,
  NE: 21,
  LS: 22,
  GR: 23,
  LE: 24,
  GE: 25,
  NOT: 30,
  LSHIFT: 31,
  RSHIFT: 32,
  LOGAND: 33,
  LOGOR: 34,
  EQV: 35,
  NEQV: 36,
  LP: 40,
  LG: 41,
  LN: 42,
  LSTR: 43,
  LL: 44,
  LLP: 45,
  LLG: 46,
  LLL: 47,
  NEEDS: 48,
  SECTION: 49,
  RTAP: 51,
  GOTO: 52,
  RETURN: 67,
  FINISH: 68,
  SWITCHON: 70,
  GLOBAL: 76,
  LOCAL: 77,
  LABEL: 78,
  SP: 80,
  SG: 81,
  SL: 82,
  STIND: 83,
  JUMP: 85,
  JT: 86,
  JF: 87,
  ENDFOR: 88,
  LAB: 90,
  STACK: 91,
  STORE: 92,
  RSTACK: 93,
  ENTRY: 94,
  SAVE: 95,
  FNRN: 96,
  RTRN: 97,
  RES: 98,
  DATALAB: 100,
  ITEM1: 101,
  ITEMN: 102,
  ENDPROC: 103,
  GETBYTE: 120,
  PUTBYTE: 121,
  INITGL: 999, // Cannot be found in implementation, but was specified in original paper
  LF: 999,
};

export type Op = keyof typeof operations;
