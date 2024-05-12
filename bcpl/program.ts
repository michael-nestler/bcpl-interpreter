import type { Command } from "./command";
import { FALSE, TRUE, WRITEF_ADDRESS, WRITES_ADDRESS } from "./constants";
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
  output = "";
  currentDataLabel = 0;

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
        if ((this.environment.pop() | 0) === (TRUE | 0)) {
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
      case "INITGL":
        initGlobalVariableToValue(this.environment, this.firstArg(command), this.resolveLabel(this.secondArg(command)));
        break;
      case "LF":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
        break;

      case "FNAP": {
        const k = this.firstArg(command);
        const returnAddress = this.programCounter;
        this.programCounter = this.environment.pop();

        const newFramePointer = this.environment.framePointer + k;
        this.environment.stack[newFramePointer] = this.environment.framePointer;
        this.environment.stack[newFramePointer + 1] = returnAddress;
        this.environment.stack[newFramePointer + 2] = this.programCounter;
        this.environment.framePointer = newFramePointer;
        this.environment.currentOffset -= k;
        break;
      }

      case "RTAP": {
        const k = this.firstArg(command);
        const target = this.environment.pop();
        switch (target) {
          case WRITEF_ADDRESS: {
            const stringRef = this.environment.stack[this.environment.framePointer + k + 3];
            const formatString = this.environment.strings.get(stringRef);
            if (!formatString) {
              console.error("writef(...) call invoked with invalid string reference", stringRef);
              return false;
            }
            let formattedString = "";
            let argumentOffset = 3;
            for (let i = 0; i < formatString.length; i++) {
              switch (formatString.charAt(i)) {
                case "%":
                  switch (formatString.charAt(++i)) {
                    case "%":
                      formattedString += "%";
                      break;
                    case "i": {
                      const width = Number(formatString.charAt(++i));
                      if (!Number.isSafeInteger(width)) {
                        console.log("Invalid format substitution", "%", "i", formatString.charAt(i));
                        return false;
                      }
                      formattedString += this.environment.stack[this.environment.framePointer + k + ++argumentOffset]
                        .toString()
                        .padStart(width);
                      break;
                    }
                    case "n": {
                      formattedString += this.environment.stack[this.environment.framePointer + k + ++argumentOffset].toString();
                      break;
                    }
                    default:
                      console.log("Invalid format substitution", "%", formatString.charAt(i));
                      return false;
                  }
                  break;
                default:
                  formattedString += formatString.charAt(i);
              }
            }
            this.output += formattedString;
            this.environment.currentOffset = k;
            console.log("[stdout]", formattedString);
            return true;
          }
          case WRITES_ADDRESS: {
            const stringRef = this.environment.stack[this.environment.framePointer + k + 3];
            const outputtedString = this.environment.strings.get(stringRef);
            if (!outputtedString) {
              console.error("writes(...) call invoked with invalid string reference", stringRef);
              return false;
            }
            this.output += outputtedString;
            console.log("[stdout]", outputtedString);
            this.environment.currentOffset = k;
            return true;
          }
          default: {
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
        }
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

      case "FINISH":
        return false;

      case "STORE":
        return true;

      case "GLOBAL": {
        const returnAddress = this.programCounter;
        this.programCounter = this.resolveLabel(this.lastArg(command));

        this.environment.push(this.environment.framePointer);
        this.environment.push(returnAddress);
        this.environment.push(this.programCounter);
        this.environment.currentOffset = 3;
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
          this.labels.set(this.currentDataLabel, this.environment.staticVariables.length - 1);
          this.currentDataLabel = 0;
        }
        break;

      case "RV": {
        const staticVariable = this.environment.pop();
        this.environment.push(this.environment.staticVariables[staticVariable]);
        break;
      }

      case "LLL":
        this.environment.push(this.resolveLabel(this.firstArg(command)));
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
