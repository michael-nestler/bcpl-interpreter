import { Program } from "../program";

export function writes(args: Int32Array, program: Program) {
  const stringRef = args[0];
  const outputtedString = program.getString(stringRef);
  program.output += outputtedString;
  if (program.printOut) {
    console.log("[stdout]", outputtedString);
  }
  return true;
}
