import { TRUE } from "../constants";
import { Program } from "../program";

export function rdargs(args: number[], program: Program): [boolean, number] {
    const argString = args[0];
    const argvPointer = args[1];
    const bound = args[2];
    console.log(argString, argvPointer, bound);
    program.environment.stack[argvPointer] = argvPointer + 2;
    program.environment.stack[argvPointer + 1] = 0;
    program.environment.stack[argvPointer + 2] = 2024;
    return [true, TRUE];
}
