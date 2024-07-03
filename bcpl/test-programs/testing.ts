import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProgram } from "..";
import { debugPrompt } from "../debug";
import type { Program } from "../program";

interface RunOptions {
  stdin: string;
  arguments: string;
  debug: boolean;
  systemDate: Date;
  printOut: boolean;
}

export async function runCode(path: string, options: Partial<RunOptions> = {}): Promise<Program> {
  console.time("Test run " + path);
  const testScript = await loadFile(path);
  const [program] = loadProgram(testScript);
  if (options.arguments) {
    program.arguments = options.arguments;
  }
  if (options.stdin) {
    program.input = options.stdin;
  }
  if (options.systemDate) {
    program.systemDate = options.systemDate;
  }
  program.printOut = Boolean(options.printOut);
  do {
    if (options.debug) {
      await debugPrompt(program);
    }
  } while (program.next());
  console.timeEnd("Test run " + path);
  console.log(program.instructionsRan, "instructions ran for", path);
  return program;
}

export async function loadFile(path: string): Promise<string> {
  return await readFile(resolve(import.meta.dir, path), { encoding: "utf8" });
}
