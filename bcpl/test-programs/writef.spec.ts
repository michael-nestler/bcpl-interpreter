import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCode } from "../parser/parser";
import { Program } from "../program";

test("writef", async () => {
  const testScript = await readFile(resolve(import.meta.dir, "./writef.ocode"), { encoding: "utf8" });
  const commands = parseCode(testScript);

  const program = new Program();
  program.commands = commands;
  commands.forEach((command, index) => {
    if (["LAB", "ENTRY"].includes(command.operation)) {
      program.labels.set(command.arguments[0], index);
    }
  });
  while (program.next());
  expect(program.output).toBe('Answer is 0\n');
});
