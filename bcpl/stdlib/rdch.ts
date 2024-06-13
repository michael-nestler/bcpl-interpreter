import { TRUE } from "../constants";
import { Program } from "../program";

export function rdch(args: number[], program: Program): [boolean, number] {
  const code = program.input.charCodeAt(program.inputOffset);
  if (Number.isNaN(code)) {
    return [true, TRUE];
  }
  program.inputOffset++;
  return [true, code];
}

export function unrdch(args: number[], program: Program) {
  return true;
}
