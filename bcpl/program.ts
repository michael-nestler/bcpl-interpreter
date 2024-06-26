import type { Command } from "./command";
import { FALSE, GLOBAL_ADDRESS_SPACE, LOCAL_ADDRESS_SPACE, STRINGS_ADDRESS_SPACE } from "./constants";
import { Environment } from "./environment";
import { absolute, divide, minus, multiply, negate, plus, remainder } from "./operations/arithmetics";
import { loadConstantFalse, loadConstantTrue, loadValue } from "./operations/constants";
import { bitwiseEquality, bitwiseInequality, leftShift, logicalAnd, logicalNot, logicalOr, rightShift } from "./operations/logical";
import { Operation } from "./operations/operations";
import { equality, greaterThan, greaterThanOrEqualTo, inequality, lessThan, lessThanOrEqualTo } from "./operations/relations";
import { setStackOffset } from "./operations/stack";
import {
  initGlobalVariableToValue,
  loadGlobalVariableToStack,
  loadLocalVariableToStack,
  saveGlobalVariableFromStack,
  saveLocalVariableFromStack,
} from "./operations/variables";
import { callStdlib, isStdlibCall } from "./stdlib";

export class Program {
  environment: Environment = new Environment();
  commands: Command[] = [];
  programCounter = 0;
  start = -1;
  labels = new Map<number, number>();
  returnValue = 0;
  output = "";
  arguments = "";
  // easter: "2024";
  // sudoku: "000638000 706000305 010000040 008712400 090000050 002569100 030000010 105000608 000184000";
  input = "";
  // procode 155 10 5 115 116 97 114 116 156 3 136 1 153 151 12 152 7 138 15 102 97 99 116 40 37 110 41 32 61 32 37 105 52 10 134 3 152 12 134 3 133 11 10 9 135 94 42 4 151 15 134 3 136 1 17 143 3 134 3 136 5 23 148 12 151 14 151 13 152 3 136 0 157 136 0 157 163 155 11 4 102 97 99 116 156 4 136 0 134 3 19 149 16 136 1 157 151 16 152 7 134 3 136 1 18 133 11 10 4 134 3 14 157 136 0 157 163 152 3 153 70 1 1 10
  inputOffset = 0;
  stringAddresses = new Map<number, number>();
  stringIndex = 0;
  instructionsRan = 0;

  next(): boolean {
    const command = this.commands[this.programCounter];
    if (!command) {
      return false;
    }
    this.programCounter++;
    this.instructionsRan++;
    switch (command.operation) {
      case Operation.TRUE:
        loadConstantTrue(this.environment);
        break;
      case Operation.FALSE:
        loadConstantFalse(this.environment);
        break;
      case Operation.LN:
        loadValue(this.environment, this.firstArg(command));
        break;
      case Operation.MUL:
      case Operation.MULT:
        multiply(this.environment);
        break;
      case Operation.DIV:
        divide(this.environment);
        break;
      case Operation.REM:
      case Operation.MOD:
        remainder(this.environment);
        break;
      case Operation.PLUS:
      case Operation.ADD:
        plus(this.environment);
        break;
      case Operation.MINUS:
      case Operation.SUB:
        minus(this.environment);
        break;
      case Operation.NEG:
        negate(this.environment);
        break;
      case Operation.ABS:
        absolute(this.environment);
        break;

      case Operation.LSHIFT:
        leftShift(this.environment);
        break;
      case Operation.RSHIFT:
        rightShift(this.environment);
        break;
      case Operation.LOGAND:
        logicalAnd(this.environment);
        break;
      case Operation.LOGOR:
        logicalOr(this.environment);
        break;
      case Operation.NOT:
        logicalNot(this.environment);
        break;
      case Operation.EQV:
        bitwiseEquality(this.environment);
        break;
      case Operation.NEQV:
      case Operation.XOR:
        bitwiseInequality(this.environment);
        break;

      case Operation.EQ:
        equality(this.environment);
        break;
      case Operation.NE:
        inequality(this.environment);
        break;
      case Operation.LS:
        lessThan(this.environment);
        break;
      case Operation.GR:
        greaterThan(this.environment);
        break;
      case Operation.LE:
        lessThanOrEqualTo(this.environment);
        break;
      case Operation.GE:
        greaterThanOrEqualTo(this.environment);
        break;

      case Operation.SAVE:
      case Operation.STACK:
        setStackOffset(this.environment, this.firstArg(command));
        break;

      case Operation.LAB:
        /* Labels are read in the initial pass of the program parser */
        break;
      case Operation.GOTO:
        this.programCounter = this.environment.pop();
        break;
      case Operation.JUMP:
        this.programCounter = this.resolveLabel(this.firstArg(command));
        break;
      case Operation.JT:
        if ((this.environment.pop() | 0) !== (FALSE | 0)) {
          this.programCounter = this.resolveLabel(this.firstArg(command));
        }
        break;
      case Operation.JF:
        if ((this.environment.pop() | 0) === (FALSE | 0)) {
          this.programCounter = this.resolveLabel(this.firstArg(command));
        }
        break;

      case Operation.LP:
        loadLocalVariableToStack(this.environment, this.firstArg(command));
        break;
      case Operation.SP:
        saveLocalVariableFromStack(this.environment, this.firstArg(command));
        break;
      case Operation.LG:
        loadGlobalVariableToStack(this.environment, this.firstArg(command));
        break;
      case Operation.SG:
        saveGlobalVariableFromStack(this.environment, this.firstArg(command));
        break;
      case Operation.LLP:
        this.environment.push(LOCAL_ADDRESS_SPACE + this.firstArg(command) + this.environment.framePointer);
        break;
      case Operation.INITGL:
        initGlobalVariableToValue(this.environment, this.firstArg(command), this.resolveLabel(this.secondArg(command)));
        break;
      case Operation.LF:
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case Operation.FNAP: {
        const k = this.firstArg(command);
        const returnAddress = this.programCounter;
        const target = this.environment.pop();
        if (isStdlibCall(target)) {
          const result = callStdlib(
            target,
            k,
            this.environment.stack.slice(
              this.environment.framePointer + k + 3,
              this.environment.framePointer + this.environment.currentOffset,
            ),
            this,
          );
          return result;
        }

        const newFramePointer = this.environment.framePointer + k;
        this.environment.stack[newFramePointer] = this.environment.framePointer;
        this.environment.stack[newFramePointer + 1] = returnAddress;
        this.environment.stack[newFramePointer + 2] = target;
        this.environment.framePointer = newFramePointer;
        this.programCounter = target;
        this.environment.currentOffset -= k;
        break;
      }

      case Operation.RTAP: {
        const k = this.firstArg(command);
        const target = this.environment.pop();
        if (isStdlibCall(target)) {
          const result = callStdlib(
            target,
            k,
            this.environment.stack.slice(
              this.environment.framePointer + k + 3,
              this.environment.framePointer + this.environment.currentOffset,
            ),
            this,
          );

          return result;
        }
        const returnAddress = this.programCounter;
        this.programCounter = target;

        const newFramePointer = this.environment.framePointer + k;
        this.environment.stack[newFramePointer] = this.environment.framePointer;
        this.environment.stack[newFramePointer + 1] = returnAddress;
        this.environment.stack[newFramePointer + 2] = target;
        this.environment.framePointer = newFramePointer;
        this.environment.currentOffset -= k;
        return true;
      }

      case Operation.ENTRY:
        break;
      case Operation.ENDPROC:
        break;

      case Operation.FNRN: {
        this.returnValue = this.environment.pop();
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        if (this.commands[this.programCounter - 1]?.operation === Operation.FNAP) {
          this.environment.push(this.returnValue);
        }
        if (this.programCounter === -1) {
          return false;
        }
        break;
      }

      case Operation.RTRN: {
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        if (this.programCounter === -1) {
          return false;
        }
        break;
      }

      case Operation.LSTR: {
        const address = this.stringAddresses.get(this.programCounter - 1);
        if (!address) {
          console.log("Unknown LSTR at pc", this.programCounter - 1, command);
          return false;
        }
        this.environment.push(address);
        break;
      }

      case Operation.RV: {
        const address = this.environment.pop();
        this.environment.push(this.environment.stack[address]);
        break;
      }

      case Operation.LLL:
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case Operation.LLG:
        this.environment.push(this.firstArg(command) + GLOBAL_ADDRESS_SPACE);
        break;

      case Operation.STIND: {
        const address = this.environment.pop();
        const value = this.environment.pop();
        this.environment.stack[address] = value;
        break;
      }

      case Operation.RES:
        this.returnValue = this.environment.pop();
        this.programCounter = this.resolveLabel(this.firstArg(command));
        break;

      case Operation.RSTACK:
        this.environment.currentOffset = this.firstArg(command);
        this.environment.push(this.returnValue);
        break;

      case Operation.SWITCHON: {
        const value = this.environment.pop();
        const defaultLabel = this.secondArg(command);
        const casesValues = command.arguments.slice(2).filter((_, index) => index % 2 === 0);
        const caseLabels = command.arguments.slice(2).filter((_, index) => index % 2 === 1);
        const caseIndex = casesValues.indexOf(value);
        if (caseIndex !== -1) {
          this.programCounter = this.resolveLabel(caseLabels[caseIndex]);
        } else {
          this.programCounter = this.resolveLabel(defaultLabel);
        }
        break;
      }

      case Operation.GETBYTE: {
        const index = this.environment.pop();
        const address = this.environment.pop();
        this.environment.push(this.getByte(address, index));
        return true;
      }

      case Operation.PUTBYTE: {
        const index = this.environment.pop();
        const address = this.environment.pop();
        const byteVal = this.environment.pop();
        this.putByte(address, index, byteVal);
        return true;
      }

      case Operation.SL: {
        const value = this.environment.pop();
        const address = this.resolveLabel(this.firstArg(command));
        this.environment.stack[address] = value | 0;
        break;
      }

      case Operation.LL: {
        const address = this.resolveLabel(this.firstArg(command));
        const value = this.environment.stack[address];
        this.environment.push(value | 0);
        break;
      }

      case Operation.QUERY:
        this.environment.push(0x1234_5678);
        break;

      case Operation.STORE:
      case Operation.SECTION:
      case Operation.DATALAB:
      case Operation.ITEMN:
      case Operation.GLOBAL:
        return true;

      case Operation.FINISH:
        return false;

      default:
        console.log(`Command not implemented: ${command.operation}`);
        return false;
    }
    return true;
  }

  getByte(address: number, index: number) {
    const intVal = this.environment.stack[address + Math.floor(index / 4)];
    return (intVal >> ((index % 4) * 8)) & 0xff;
  }

  getString(stringRef: number) {
    const length = this.getByte(stringRef, 0);
    let result = "";
    for (let i = 1; i <= length; i++) {
      result += String.fromCharCode(this.getByte(stringRef, i));
    }
    return result;
  }

  putByte(address: number, index: number, value: number) {
    const byteMask = 0xff << ((index % 4) * 8);
    const shiftedByte = (value & 0xff) << (index * 8);
    this.environment.stack[address + Math.floor(index / 4)] &= ~byteMask;
    this.environment.stack[address + Math.floor(index / 4)] |= shiftedByte;
  }

  putString(value: number[] | string): number {
    if (typeof value === "string") {
      const strValue = [value.length, ...[...value].map((x) => x.charCodeAt(0))];
      return this.putString(strValue);
    }
    const addr = STRINGS_ADDRESS_SPACE + this.stringIndex;
    for (const [index, arg] of value.entries()) {
      this.putByte(addr, index, arg);
    }
    this.stringIndex += Math.ceil(value.length / 4);
    return addr;
  }

  private firstArg(command: Command): number {
    this.require(
      command.arguments[0] !== undefined,
      `Expected an argument for command of type ${command.operation} at ${command.start} - ${command.end}`,
    );
    return command.arguments[0];
  }
  private secondArg(command: Command): number {
    this.require(command.arguments[1] !== undefined, `Expected a second argument for command of type ${command.operation}`);
    return command.arguments[1];
  }

  resolveLabel(labelIndex: number): number {
    const result = this.labels.get(labelIndex);
    this.require(result !== undefined, `Expected to find referenced label L${labelIndex}`);
    return result;
  }

  private require(condition: boolean, errorMessage: string): asserts condition {
    if (!condition) {
      throw new Error(`Assertion failed: ${errorMessage}`);
    }
  }

  copy() {
    return Object.assign(Object.create(Program.prototype), this, { environment: this.environment.copy() });
  }

  reset() {
    this.environment.clear();
    this.programCounter = 0;
    this.inputOffset = 0;
    this.instructionsRan = 0;
    if (this.start !== -1) {
      this.startup();
    }
  }

  startup() {
    this.programCounter = this.start;
    this.environment.push(this.environment.framePointer);
    this.environment.push(-1);
    this.environment.push(this.programCounter);
    this.environment.framePointer = this.environment.currentOffset - 3;
    this.environment.currentOffset = 3;
  }
}
