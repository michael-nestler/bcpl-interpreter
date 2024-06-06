import { Program } from "../program";

export function writes(args: number[], program: Program) {
    const stringRef = args[0];
    const outputtedString = program.environment.strings.get(stringRef);
    if (!outputtedString) {
      console.error("writes(...) call invoked with invalid string reference", stringRef);
      return false;
    }
    program.output += outputtedString;
    console.log("[stdout]", outputtedString);
    return true;
}
