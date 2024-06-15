import { GLOBAL_ADDRESS_SPACE, STACK_SIZE, TRUE } from "./constants";
import { STDLIB_FUNCTIONS, STDLIB_SPACE } from "./stdlib";

export class Environment {
  stack: Int32Array = new Int32Array(STACK_SIZE);
  framePointer = 0;
  currentOffset = 1;

  strings = new Map<number, string>();
  staticVariables: number[] = [];

  constructor() {
    for (const stdlibFunction of STDLIB_FUNCTIONS.keys()) {
      this.setGlobalVariable(stdlibFunction, (STDLIB_SPACE + stdlibFunction) | 0);
    }
  }

  clear() {
    this.stack.fill(0);
    for (const stdlibFunction of STDLIB_FUNCTIONS.keys()) {
      this.setGlobalVariable(stdlibFunction, (STDLIB_SPACE + stdlibFunction) | 0);
    }
    this.strings.clear();
    this.staticVariables = [];
    this.framePointer = 0;
    this.currentOffset = 1;
  }

  push(value: number) {
    this.currentOffset++;
    const offset = this.framePointer + this.currentOffset - 1;
    this.stack[offset] = value & TRUE;
  }

  pop(): number {
    const offset = this.framePointer + this.currentOffset - 1;
    const value = this.stack[offset];
    this.stack[offset] = 0;
    this.currentOffset--;
    return value;
  }

  topValue(): number {
    return this.stack[this.framePointer + this.currentOffset - 1] | 0;
  }

  monadicOperation(operation: (a: number) => number) {
    const offset = this.framePointer + this.currentOffset - 1;
    this.stack[offset] = operation(this.stack[offset]) & TRUE;
  }

  retrieve() {
    throw new Error("Method not implemented.");
  }

  diadicOperation(operation: (a: number, b: number) => number) {
    const leftOffset = this.framePointer + this.currentOffset - 2;
    const rightOffset = this.framePointer + this.currentOffset - 1;
    this.stack[leftOffset] = operation(this.stack[leftOffset], this.stack[rightOffset]) & TRUE;

    this.currentOffset = this.currentOffset - 1;
  }

  storeString(string: string): number {
    const key = Math.floor(Math.random() * 0xffff);
    this.strings.set(key, string);
    return key;
  }

  stackSlice(): number[] {
    return Array.from(this.stack.slice(0, this.framePointer + this.currentOffset).values());
  }

  setGlobalVariable(index: number, value: number) {
    this.stack[GLOBAL_ADDRESS_SPACE + index] = value;
  }

  getGlobalVariable(index: number) {
    return this.stack[GLOBAL_ADDRESS_SPACE + index];
  }
}
