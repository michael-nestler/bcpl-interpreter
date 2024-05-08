import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCode } from "../parser/parser";
import { Program } from "../program";
import { debugPrompt } from "../debug";

export async function runCode(path: string, debug: boolean = false): Promise<Program> {
    console.time("Test run");
    const testScript = await readFile(resolve(import.meta.dir, path), { encoding: "utf8" });
    const commands = parseCode(testScript);

    const program = new Program();
    program.commands = commands;
    commands.forEach((command, index) => {
        if (["LAB", "ENTRY"].includes(command.operation)) {
            program.labels.set(command.arguments[0], index);
        }
    });
    do {
        if (debug) {
            await debugPrompt(program);
        }
    } while (program.next())
    console.timeEnd("Test run");
    return program;
}