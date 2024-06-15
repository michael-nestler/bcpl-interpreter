import { FALSE } from "../constants";
import { Program } from "../program";

export function findoutput(args: Int32Array, program: Program): [boolean, number] {
  const filename = program.getString(args[0]);
  if (filename === "*") {
    return [true, 1];
  }
  console.log("Unknown file", filename);
  return [true, FALSE];
}
