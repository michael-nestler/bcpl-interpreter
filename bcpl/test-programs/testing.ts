import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProgram } from "..";
import { debugPrompt } from "../debug";
import { Program } from "../program";

export async function runCode(path: string, debug: boolean = false): Promise<Program> {
    console.time("Test run");
    const testScript = await readFile(resolve(import.meta.dir, path), { encoding: "utf8" });
    const program = loadProgram(testScript);
    do {
        if (debug) {
            await debugPrompt(program);
        }
    } while (program.next())
    console.timeEnd("Test run");
    return program;
}