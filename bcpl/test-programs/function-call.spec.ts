import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseCode } from "../parser/parser";
import { Program } from "../program";

test("function-call", async () => {
  const testScript = await readFile(resolve(import.meta.dir, "./function-call.ocode"), { encoding: "utf8" });
  const commands = parseCode(testScript);

  const program = new Program();
  program.commands = commands;
  commands.forEach((command, index) => {
    if (command.operation === "LAB" || command.operation === "ENTRY") {
      program.labels.set(command.arguments[0], index);
    }
  });

  while (program.next());
  expect(program.environment.stack).toEqual([9, 418]);
});
