import type { Command } from "./command";
import { FALSE, GLOBAL_ADDRESS_SPACE, LOCAL_ADDRESS_SPACE, STATIC_ADDRESS_SPACE, STRINGS_ADDRESS_SPACE } from "./constants";
import { Environment } from "./environment";
import { absolute, divide, minus, multiply, negate, plus, remainder } from "./operations/arithmetics";
import { loadConstantFalse, loadConstantTrue, loadValue } from "./operations/constants";
import { bitwiseEquality, bitwiseInequality, leftShift, logicalAnd, logicalNot, logicalOr, rightShift } from "./operations/logical";
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
      case "TRUE":
        loadConstantTrue(this.environment);
        break;
      case "FALSE":
        loadConstantFalse(this.environment);
        break;
      case "LN":
        loadValue(this.environment, this.firstArg(command));
        break;
      case "MUL":
      case "MULT":
        multiply(this.environment);
        break;
      case "DIV":
        divide(this.environment);
        break;
      case "REM":
      case "MOD":
        remainder(this.environment);
        break;
      case "PLUS":
      case "ADD":
        plus(this.environment);
        break;
      case "MINUS":
      case "SUB":
        minus(this.environment);
        break;
      case "NEG":
        negate(this.environment);
        break;
      case "ABS":
        absolute(this.environment);
        break;

      case "LSHIFT":
        leftShift(this.environment);
        break;
      case "RSHIFT":
        rightShift(this.environment);
        break;
      case "LOGAND":
        logicalAnd(this.environment);
        break;
      case "LOGOR":
        logicalOr(this.environment);
        break;
      case "NOT":
        logicalNot(this.environment);
        break;
      case "EQV":
        bitwiseEquality(this.environment);
        break;
      case "NEQV":
      case "XOR":
        bitwiseInequality(this.environment);
        break;

      case "EQ":
        equality(this.environment);
        break;
      case "NE":
        inequality(this.environment);
        break;
      case "LS":
        lessThan(this.environment);
        break;
      case "GR":
        greaterThan(this.environment);
        break;
      case "LE":
        lessThanOrEqualTo(this.environment);
        break;
      case "GE":
        greaterThanOrEqualTo(this.environment);
        break;

      case "SAVE":
      case "STACK":
        setStackOffset(this.environment, this.firstArg(command));
        break;

      case "LAB":
        /* Labels are read in the initial pass of the program parser */
        break;
      case "GOTO":
        this.programCounter = this.environment.pop();
        break;
      case "JUMP":
        this.programCounter = this.resolveLabel(this.firstArg(command));
        break;
      case "JT":
        if ((this.environment.pop() | 0) !== (FALSE | 0)) {
          this.programCounter = this.resolveLabel(this.firstArg(command));
        }
        break;
      case "JF":
        if ((this.environment.pop() | 0) === (FALSE | 0)) {
          this.programCounter = this.resolveLabel(this.firstArg(command));
        }
        break;

      case "LP":
        loadLocalVariableToStack(this.environment, this.firstArg(command));
        break;
      case "SP":
        saveLocalVariableFromStack(this.environment, this.firstArg(command));
        break;
      case "LG":
        loadGlobalVariableToStack(this.environment, this.firstArg(command));
        break;
      case "SG":
        saveGlobalVariableFromStack(this.environment, this.firstArg(command));
        break;
      case "LLP":
        this.environment.push(LOCAL_ADDRESS_SPACE + this.firstArg(command) + this.environment.framePointer);
        break;
      case "INITGL":
        initGlobalVariableToValue(this.environment, this.firstArg(command), this.resolveLabel(this.secondArg(command)));
        break;
      case "LF":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case "FNAP": {
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

      case "RTAP": {
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

      case "ENTRY":
        break;
      case "ENDPROC":
        break;

      case "FNRN": {
        this.returnValue = this.environment.pop();
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        if (this.commands[this.programCounter - 1]?.operation === "FNAP") {
          this.environment.push(this.returnValue);
        }
        if (this.programCounter === -1) {
          return false;
        }
        break;
      }

      case "RTRN": {
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        if (this.programCounter === -1) {
          return false;
        }
        break;
      }

      case "LSTR": {
        const address = this.stringAddresses.get(this.programCounter - 1);
        if (!address) {
          console.log("Unknown LSTR at pc", this.programCounter - 1, command);
          return false;
        }
        this.environment.push(address);
        break;
      }

      case "RV": {
        const address = this.environment.pop();
        this.environment.push(this.environment.stack[address]);
        break;
      }

      case "LLL":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case "LLG":
        this.environment.push(this.firstArg(command) + GLOBAL_ADDRESS_SPACE);
        break;

      case "STIND": {
        const address = this.environment.pop();
        const value = this.environment.pop();
        this.environment.stack[address] = value;
        break;
      }

      case "RES":
        this.returnValue = this.environment.pop();
        this.programCounter = this.resolveLabel(this.firstArg(command));
        break;

      case "RSTACK":
        this.environment.currentOffset = this.firstArg(command);
        this.environment.push(this.returnValue);
        break;

      case "SWITCHON": {
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

      case "GETBYTE": {
        const index = this.environment.pop();
        const address = this.environment.pop();
        this.environment.push(this.getByte(address, index));
        return true;
      }

      case "PUTBYTE": {
        const index = this.environment.pop();
        const address = this.environment.pop();
        const byteVal = this.environment.pop();
        this.putByte(address, index, byteVal);
        return true;
      }

      case "SL": {
        const value = this.environment.pop();
        const address = this.resolveLabel(this.firstArg(command));
        this.environment.stack[address] = value | 0;
        break;
      }

      case "LL": {
        const address = this.resolveLabel(this.firstArg(command));
        const value = this.environment.stack[address];
        this.environment.push(value | 0);
        break;
      }

      case "QUERY":
        this.environment.push(0x1234_5678);
        break;

      case "STORE":
      case "SECTION":
      case "DATALAB":
      case "ITEMN":
      case "GLOBAL":
        return true;

      case "FINISH":
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
    return Object.assign(Object.create(Program.prototype), this, { environment: this.environment.copy() })
  }

  reset() {
    this.environment.clear();
    this.programCounter = 0;
    this.inputOffset = 0;
    this.instructionsRan = 0;
    if (this.start !== -1) {
      this.programCounter = this.start;
      this.environment.push(this.environment.framePointer);
      this.environment.push(-1);
      this.environment.push(this.programCounter);
      this.environment.framePointer = this.environment.currentOffset - 3;
      this.environment.currentOffset = 3;
    }
  }
}
