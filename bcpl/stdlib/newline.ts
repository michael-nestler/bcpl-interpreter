import { Program } from "../program";

export function newline(args: number[], program: Program) {
    program.output += '\n';
    console.log("[stdout]");
    return true;
}
