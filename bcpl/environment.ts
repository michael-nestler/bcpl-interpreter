import { TRUE, WRITEF_ADDRESS } from "./constants";

export class Environment {
  stack: number[] = [];
  framePointer = 0;
  currentOffset = 0;

  globalVariables: number[] = [];

  strings = new Map<number, string>();

  constructor() {
    this.globalVariables[74] = WRITEF_ADDRESS;
  }
  
  clear() {
    this.stack = [];
    this.framePointer = 0;
    this.currentOffset = 0;
  }

  push(value: number) {
    this.currentOffset++;
    const offset = this.framePointer + this.currentOffset - 1;
    this.stack[offset] = value & TRUE;
  }

  pop(): number {
    const offset = this.framePointer + this.currentOffset - 1;
    const value = this.stack[offset];
    delete this.stack[offset];
    this.currentOffset--;
    return value;
  }

  topValue(): number {
    return this.stack[this.framePointer + this.currentOffset - 1];
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
    const key = Math.floor(Math.random() * TRUE);
    this.strings.set(key, string);
    return key;
  }
}
