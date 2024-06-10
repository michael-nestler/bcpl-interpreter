import { Program } from "../program";

const OP_WRC = 11;
const OP_MULDIV = 26;

export function sys(args: number[], program: Program): boolean | [boolean, number] {
    const op = args[0];
    switch (op) {
        case OP_WRC: {
            program.output += String.fromCharCode(args[1]);
            return true;
        }
        case OP_MULDIV: {
            const [_, x, y, z] = args;
            return [true, x * y / z];
        }
    }
    console.error("Unknown sys op", op, args);
    return false;
}
