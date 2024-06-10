import type { Command } from "./command";
import { FALSE, GLOBAL_ADDRESS_SPACE, LOCAL_ADDRESS_SPACE, STATIC_ADDRESS_SPACE, TRUE } from "./constants";
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
import { callStdlib, isStdlibCall } from "./stdlib";

export class Program {
  environment: Environment = new Environment();
  commands: Command[] = [];
  programCounter = 0;
  labels = new Map<number, number>();
  returnValue = 0;
  output = "";
  currentDataLabel = 0;
  // arguments = "2024";
  arguments = "000638000 706000305 010000040 008712400 090000050 002569100 030000010 105000608 000184000";

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
          const result = callStdlib(target, k, this.environment.stack.slice(this.environment.framePointer + k + 3, this.environment.framePointer + this.environment.currentOffset), this);
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
          const result = callStdlib(target, k, this.environment.stack.slice(this.environment.framePointer + k + 3, this.environment.framePointer + this.environment.currentOffset), this);

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

      case "SAVE":
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

      case "RTRN": {
        const oldFramePointer = this.environment.stack[this.environment.framePointer];
        this.programCounter = this.environment.stack[this.environment.framePointer + 1];
        this.environment.currentOffset = this.environment.framePointer - oldFramePointer;
        this.environment.framePointer = oldFramePointer;
        this.environment.stack.splice(this.environment.framePointer + this.environment.currentOffset);
        break;
      }

      case "GLOBAL": {
        const returnAddress = this.programCounter;
        const labelIndex = command.arguments.slice(1).findIndex((value, index) => value === 1 && index % 2 === 0);
        for (let i = 1; i < command.arguments.length - 1; i += 2) {
          this.environment.globalVariables[command.arguments[i]] = command.arguments[i + 1];
        }
        if (labelIndex !== -1) {
          this.programCounter = this.resolveLabel(command.arguments[labelIndex + 2]);

          this.environment.push(this.environment.framePointer);
          this.environment.push(returnAddress);
          this.environment.push(this.programCounter);
          this.environment.currentOffset = 3;
        } else {
          console.log("Encountered GLOBAL without entry at index 1");
        }
        break;
      }

      case "LSTR": {
        const string = String.fromCharCode(...command.arguments.slice(1));
        this.environment.push(this.environment.storeString(string));
        break;
      }

      case "DATALAB":
        this.currentDataLabel = this.firstArg(command);
        break;

      case "ITEMN":
        this.environment.staticVariables.push(this.firstArg(command));
        if (this.currentDataLabel) {
          this.labels.set(this.currentDataLabel, STATIC_ADDRESS_SPACE + this.environment.staticVariables.length - 1);
          this.currentDataLabel = 0;
        }
        break;

      case "RV": {
        const address = this.environment.pop();
        if ((address & STATIC_ADDRESS_SPACE) === (STATIC_ADDRESS_SPACE | 0)) {
          console.log('Loading static variable', address, (address | 0) - (STATIC_ADDRESS_SPACE | 0));
          this.environment.push(this.environment.staticVariables[(address | 0) - (STATIC_ADDRESS_SPACE | 0)]);
        } else if ((address & GLOBAL_ADDRESS_SPACE) === (GLOBAL_ADDRESS_SPACE | 0)) {
          console.log('Loading global variable', address, (address | 0) - (GLOBAL_ADDRESS_SPACE | 0));
          this.environment.push(this.environment.globalVariables[(address | 0) - (GLOBAL_ADDRESS_SPACE | 0)]);
        } else {
          this.environment.push(this.environment.stack[address]);
        }
        break;
      }

      case "LLL":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case "LLG":
        this.environment.push(this.firstArg(command) + GLOBAL_ADDRESS_SPACE);
        break;
      
      case "STIND":
        const address = this.environment.pop();
        const value = this.environment.pop();
        this.environment.globalVariables[(address | 0 ) - (GLOBAL_ADDRESS_SPACE | 0)] = value;
        break;
      
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
        
        
      case "STORE":
      case "SECTION":
        return true;

      case "FINISH":
        return false;

      default:
        console.log(`Command not implemented: ${command.operation}`);
        return false;
    }
    return true;
  }

  private firstArg(command: Command): number {
    this.require(command.arguments[0] !== undefined, `Expected an argument for command of type ${command.operation} at ${command.start} - ${command.end}`);
    return command.arguments[0];
  }
  private secondArg(command: Command): number {
    this.require(command.arguments[1] !== undefined, `Expected a second argument for command of type ${command.operation}`);
    return command.arguments[1];
  }

  private lastArg(command: Command): number {
    const arg = command.arguments.at(-1);
    this.require(arg !== undefined, `Expected an argument for command of type ${command.operation}`);
    return arg;
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
