import { GLOBAL_ADDRESS_SPACE, STACK_SIZE, STATIC_ADDRESS_SPACE, TRUE } from "./constants";
import { STDLIB_FUNCTIONS, STDLIB_SPACE } from "./stdlib";

export class Environment {
  stack: Int32Array = new Int32Array(STACK_SIZE);
  framePointer = 0;
  currentOffset = 0;

  constructor() {
    this.clear();
  }

  clear() {
    this.stack.fill(0);
    this.framePointer = 0;
    this.currentOffset = 0;
    for (const stdlibFunction of STDLIB_FUNCTIONS.keys()) {
      this.setGlobalVariable(stdlibFunction, (STDLIB_SPACE + stdlibFunction) | 0);
    }
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

  stackSlice(): number[] {
    return Array.from(this.stack.slice(0, this.framePointer + this.currentOffset).values());
  }

  setGlobalVariable(index: number, value: number) {
    this.stack[GLOBAL_ADDRESS_SPACE + index] = value;
  }

  getGlobalVariable(index: number) {
    return this.stack[GLOBAL_ADDRESS_SPACE + index];
  }

  setStaticVariable(index: number, value: number) {
    this.stack[STATIC_ADDRESS_SPACE + index] = value;
  }

  getStaticVariable(index: number) {
    return this.stack[STATIC_ADDRESS_SPACE + index];
  }

  copy() {
    return Object.assign(Object.create(Environment.prototype), this, { stack: this.stack.slice() });
  }
}
