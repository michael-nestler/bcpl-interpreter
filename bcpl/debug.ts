import * as readline from "readline/promises";
import { Command } from "./command";
import { Environment } from "./environment";
import { Program } from "./program";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export async function debugPrompt(program: Program) {
    printFrame(program.environment);
    const command = program.commands[program.programCounter];
    if (command) {
        printCommand(command);
    }
    await confirmation();
}

async function confirmation(): Promise<string> {
    return rl.question("?");
}

function printCommand(command: Command) {
    console.log(`${command.start[0]} ${command.operation} ${command.arguments.join(" ")}`);
}

function printFrame(environment: Environment) {
    const cells = environment.stack.map((value, index) => {
        if (index === environment.framePointer) {
            return "(P) " + value;
        }
        if (index === environment.framePointer + environment.currentOffset) {
            return "->";
        }
        return value.toString();
    });
    for (let i = cells.length; i <= environment.framePointer + environment.currentOffset; i++) {
        cells.push("->");
    }
    console.log(cells.join(" | "));
}