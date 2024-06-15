import { TRUE } from "../constants";
import { Program } from "../program";

export function rdch(args: Int32Array, program: Program): [boolean, number] {
  const code = program.input.charCodeAt(program.inputOffset);
  if (Number.isNaN(code)) {
    return [true, TRUE];
  }
  program.inputOffset++;
  return [true, code];
}

export function unrdch(args: Int32Array, program: Program) {
  return true;
}
