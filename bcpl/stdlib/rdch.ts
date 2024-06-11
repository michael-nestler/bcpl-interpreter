import { TRUE } from "../constants";
import { Program } from "../program";

export function rdch(args: number[], program: Program): [boolean, number] {
  return [true, TRUE];
}

export function unrdch(args: number[], program: Program) {
  return true;
}
