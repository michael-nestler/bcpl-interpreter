import { Program } from "../program";

export function newline(args: Int32Array, program: Program) {
  program.output += "\n";
  if (program.printOut) {
    console.log("[stdout]");
  }
  return true;
}
