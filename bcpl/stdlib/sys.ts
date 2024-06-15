import { RESULT2_GLOBAL_INDEX } from "../constants";
import { Program } from "../program";

const OP_WRC = 11;
const OP_MULDIV = 26;

export function sys(args: Int32Array, program: Program): boolean | [boolean, number] {
  const op = args[0];
  switch (op) {
    case OP_WRC: {
      program.output += String.fromCharCode(args[1]);
      return true;
    }
    case OP_MULDIV: {
      const [_, x, y, z] = args;
      const result = Math.floor((x * y) / z);
      const remainder = x * y - result * z;
      program.environment.setGlobalVariable(RESULT2_GLOBAL_INDEX, remainder);
      return [true, result | 0];
    }
  }
  console.error("Unknown sys op", op, args);
  return false;
}
