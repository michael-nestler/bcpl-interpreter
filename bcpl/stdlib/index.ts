import { Program } from "../program";
import { newline } from "./newline";
import { rdargs } from "./rdargs";
import { sys } from "./sys";
import { writef } from "./writef";
import { writes } from "./writes";

export const STDLIB_SPACE = 0xffff_0000;

export function isStdlibCall(target: number) {
    return Boolean(target & STDLIB_SPACE);
}

export function callStdlib(target: number, k: number, args: number[], program: Program) {
    const stdlibFunction = STDLIB_FUNCTIONS.get((target | 0) - (STDLIB_SPACE | 0));
    if (!stdlibFunction) {
        console.error("Unknown stdlib function", target);
        return false;
    }         
    const result = stdlibFunction(args, program); 
    program.environment.currentOffset = k;
    if (Array.isArray(result)) {
        const [success, returnValue] = result;
        program.environment.push(returnValue);
        return success;
    }
    return result;
}

export type stdlibFunctionSignature = ((args: number[], program: Program) => boolean | [boolean, number]); 

export const STDLIB_FUNCTIONS: Map<number, stdlibFunctionSignature> = new Map();
STDLIB_FUNCTIONS.set(3, sys);
STDLIB_FUNCTIONS.set(84, newline);
STDLIB_FUNCTIONS.set(89, writes);
STDLIB_FUNCTIONS.set(94, writef);
STDLIB_FUNCTIONS.set(102, rdargs);
