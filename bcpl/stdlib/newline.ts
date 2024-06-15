import { Program } from "../program";

export function newline(args: Int32Array, program: Program) {
  program.output += "\n";
  console.log("[stdout]");
  return true;
}
