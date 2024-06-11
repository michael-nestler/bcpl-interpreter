import { Program } from "../program";

export function wrch(args: number[], program: Program) {
    program.output += String.fromCharCode(args[0]);
    return true;
}
