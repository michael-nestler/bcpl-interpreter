import { STRINGS_ADDRESS_SPACE } from "../constants";
import { Program } from "../program";

export function writes(args: Int32Array, program: Program) {
  const stringRef = args[0];
  const outputtedString = program.environment.strings.get((stringRef | 0) - (STRINGS_ADDRESS_SPACE | 0));
  if (!outputtedString) {
    console.error("writes(...) call invoked with invalid string reference", stringRef, program.environment.strings.keys());
    return false;
  }
  program.output += outputtedString;
  console.log("[stdout]", outputtedString);
  return true;
}
