import { FALSE, STRINGS_ADDRESS_SPACE } from "../constants";
import { Program } from "../program";

export function findoutput(args: number[], program: Program): [boolean, number] {
  const filename = program.environment.strings.get((args[0] | 0) - (STRINGS_ADDRESS_SPACE | 0));
  if (filename === '*') {
    return [true, 1];
  }
  console.log("Unknown file", filename);
  return [true, FALSE];
}
