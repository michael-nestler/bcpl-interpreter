import { Program } from "../program";
import { dat_to_strings } from "./dat_to_strings";
import { datstamp } from "./datstamp";
import { endread } from "./endread";
import { endwrite } from "./endwrite";
import { findinput } from "./findinput";
import { findoutput } from "./findoutput";
import { newline } from "./newline";
import { output } from "./output";
import { rdargs } from "./rdargs";
import { rdch, unrdch } from "./rdch";
import { selectinput } from "./selectinput";
import { selectoutput } from "./selectoutput";
import { sys } from "./sys";
import { wrch } from "./wrch";
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

export type stdlibFunctionSignature = (args: number[], program: Program) => boolean | [boolean, number];

export const STDLIB_FUNCTIONS: Map<number, stdlibFunctionSignature> = new Map();
STDLIB_FUNCTIONS.set(3, sys);
STDLIB_FUNCTIONS.set(38, rdch);
STDLIB_FUNCTIONS.set(40, unrdch);
STDLIB_FUNCTIONS.set(41, wrch);
STDLIB_FUNCTIONS.set(48, findinput);
STDLIB_FUNCTIONS.set(49, findoutput);
STDLIB_FUNCTIONS.set(56, selectinput);
STDLIB_FUNCTIONS.set(57, selectoutput);
STDLIB_FUNCTIONS.set(59, output);
STDLIB_FUNCTIONS.set(60, endread);
STDLIB_FUNCTIONS.set(61, endwrite);
STDLIB_FUNCTIONS.set(84, newline);
STDLIB_FUNCTIONS.set(89, writes);
STDLIB_FUNCTIONS.set(94, writef);
STDLIB_FUNCTIONS.set(102, rdargs);
STDLIB_FUNCTIONS.set(109, datstamp);
STDLIB_FUNCTIONS.set(110, dat_to_strings);
