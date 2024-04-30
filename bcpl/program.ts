import type { Command } from "./command";
import { FALSE, TRUE, WRITEF_ADDRESS } from "./constants";
import { Environment } from "./environment";
import { divide, minus, multiply, negate, plus, remainder } from "./operations/arithmetics";
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

export class Program {
  environment: Environment = new Environment();
  commands: Command[] = [];
  programCounter = 0;
  labels = new Map<number, number>();
  returnValue = 0;
  output: string = "";

  next(): boolean {
    const command = this.commands[this.programCounter];
    if (!command) {
      return false;
    }
    this.programCounter++;
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
      case "MULT":
        multiply(this.environment);
        break;
      case "DIV":
        divide(this.environment);
        break;
      case "REM":
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

      case "STACK":
        setStackOffset(this.environment, this.firstArg(command));
        break;

      case "LAB":
        /* Labels are read in the initial pass of the program parser */
        break;
      case "GOTO":
        this.programCounter = this.firstArg(command);
        break;
      case "JUMP":
        this.programCounter = this.resolveLabel(this.firstArg(command));
        break;
      case "JT":
        if (this.environment.pop() === TRUE) {
          this.programCounter = this.resolveLabel(this.firstArg(command));
        }
        break;
      case "JF":
        if (this.environment.pop() === FALSE) {
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
      case "INITGL":
        initGlobalVariableToValue(this.environment, this.firstArg(command), this.resolveLabel(this.secondArg(command)));
        break;
      case "LF":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case "FNAP": {
        const returnAddress = this.programCounter;
        const functionAddress = 0x1234;
        this.programCounter = this.environment.pop();

        const oldOffset = this.environment.currentOffset;
        this.environment.push(this.environment.framePointer);
        this.environment.push(returnAddress);
        this.environment.push(functionAddress);
        this.environment.framePointer += oldOffset;
        this.environment.currentOffset = 0;
        break;
      }

      case "RTAP": {
        if (this.environment.topValue() === WRITEF_ADDRESS) {
          const k = this.firstArg(command);
          const formatString = this.environment.strings.get(this.environment.stack[this.environment.framePointer + k + 3])!;
          this.output += formatString.replace("%n", this.environment.stack[this.environment.framePointer + k + 4].toString());
          break;
        }
        return false;
      }

      case "ENTRY":
      case "ENDPROC":
        break;

      case "SAVE":
        this.environment.currentOffset += this.firstArg(command);
        break;

      case "FNRN": {
        this.returnValue = this.environment.pop();
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        this.environment.push(this.returnValue);
        this.environment.stack.splice(this.environment.framePointer + this.environment.currentOffset);
        break;
      }

      case "FINISH":
        return false;

      case "STORE":
        return true;

      case "GLOBAL":
        const returnAddress = this.programCounter;
        const functionAddress = 0x1234;
        this.programCounter = this.resolveLabel(command.arguments.at(-1)!);

        const oldOffset = this.environment.currentOffset;
        this.environment.push(this.environment.framePointer);
        this.environment.push(returnAddress);
        this.environment.push(functionAddress);
        this.environment.framePointer += oldOffset;
        this.environment.currentOffset = 0;
        break;

      case "LSTR":
        const string = String.fromCharCode(...command.arguments.slice(1));
        this.environment.push(this.environment.storeString(string));
        break;

      default:
        console.log(`Command not implemented: ${command.operation}`);
        return false;
    }
    return true;
  }

  private firstArg(command: Command): number {
    this.require(command.arguments[0] !== undefined, `Expected an argument for command of type ${command.operation}`);
    return command.arguments[0];
  }

  private secondArg(command: Command): number {
    this.require(command.arguments[1] !== undefined, `Expected a second argument for command of type ${command.operation}`);
    return command.arguments[1];
  }

  private resolveLabel(labelIndex: number): number {
    const result = this.labels.get(labelIndex);
    this.require(result !== undefined, `Expected to find referenced label L${labelIndex}`);
    return result;
  }

  private require(condition: boolean, errorMessage: string): asserts condition {
    if (!condition) {
      throw new Error(`Assertion failed: ${errorMessage}`);
    }
  }
}
