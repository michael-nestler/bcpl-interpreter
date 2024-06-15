import { Program } from "../program";

export function wrch(args: Int32Array, program: Program) {
  program.output += String.fromCharCode(args[0]);
  return true;
}
