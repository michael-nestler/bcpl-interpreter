import { Command } from "./command";
import { Environment } from "./environment";
import { divide, minus, multiply, negate, plus, remainder } from "./operations/arithmetics";
import { loadConstantFalse, loadConstantTrue, loadValue } from "./operations/constants";
import assert from "node:assert";
import { bitwiseEquality, bitwiseInequality, leftShift, logicalAnd, logicalNot, logicalOr, rightShift } from "./operations/logical";
import { equality, greaterThan, greaterThanOrEqualTo, inequality, lessThan, lessThanOrEqualTo } from "./operations/relations";
import { setStackOffset } from "./operations/stack";
import { FALSE, TRUE } from "./constants";
import { initGlobalVariableToValue, loadGlobalVariableToStack, loadLocalVariableToStack, saveGlobalVariableFromStack, saveLocalVariableFromStack } from "./operations/variables";

export class Program {

    environment: Environment = new Environment()
    commands: Command[] = [];
    programCounter = 0;
    labels = new Map<number, number>();

    next(): boolean {
        const command = this.commands[this.programCounter];
        this.programCounter++;
        switch (command.operation) {
            case "TRUE": loadConstantTrue(this.environment); break;
            case "FALSE": loadConstantFalse(this.environment); break;
            case "LN": loadValue(this.environment, this.firstArg(command)); break;
            case "MULT": multiply(this.environment); break;
            case "DIV": divide(this.environment); break;
            case "REM": remainder(this.environment); break;
            case "PLUS": plus(this.environment); break;
            case "MINUS": minus(this.environment); break;
            case "NEG": negate(this.environment); break;

            case "LSHIFT": leftShift(this.environment); break;
            case "RSHIFT": rightShift(this.environment); break;
            case "LOGAND": logicalAnd(this.environment); break;
            case "LOGOR": logicalOr(this.environment); break;
            case "NOT": logicalNot(this.environment); break;
            case "EQV": bitwiseEquality(this.environment); break;
            case "NEQV": bitwiseInequality(this.environment); break;

            case "EQ": equality(this.environment); break;
            case "NE": inequality(this.environment); break;
            case "LS": lessThan(this.environment); break;
            case "GR": greaterThan(this.environment); break;
            case "LE": lessThanOrEqualTo(this.environment); break;
            case "GE": greaterThanOrEqualTo(this.environment); break;

            case "STACK": setStackOffset(this.environment, this.firstArg(command)); break;

            case "LAB": /* Labels are read in the initial pass of the program parser */ break;
            case "GOTO": this.programCounter = this.firstArg(command); break;
            case "JUMP": this.programCounter = this.resolveLabel(this.firstArg(command)); break;
            case "JT": if (this.environment.pop() === TRUE) { this.programCounter = this.resolveLabel(this.firstArg(command)) } break;
            case "JF": if (this.environment.pop() === FALSE) { this.programCounter = this.resolveLabel(this.firstArg(command)) } break;

            case "LP": loadLocalVariableToStack(this.environment, this.firstArg(command)); break;
            case "SP": saveLocalVariableFromStack(this.environment, this.firstArg(command)); break;
            case "LG": loadGlobalVariableToStack(this.environment, this.firstArg(command)); break;
            case "SG": saveGlobalVariableFromStack(this.environment, this.firstArg(command)); break;
            case "INITGL": initGlobalVariableToValue(this.environment, this.firstArg(command), this.resolveLabel(this.secondArg(command))); break;

            case "FINISH": return false;
        }
        return true;
    }

    private firstArg(command: Command): number {
        assert(command.arguments[0] != undefined, `Expected an argument for command of type ${command.operation}`);
        return command.arguments[0];
    }

    private secondArg(command: Command): number {
        assert(command.arguments[1] != undefined, `Expected a second argument for command of type ${command.operation}`);
        return command.arguments[1];
    }

    private resolveLabel(labelIndex: number): number {
        const result = this.labels.get(labelIndex);
        assert(result != undefined, `Expected to find referenced label L${labelIndex}`);
        return result;
    }
}
