import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("date", async () => {
  const program = await runCode("./date.ocode", { systemDate: new Date("2024-07-03T12:00:00Z") });
  expect(program.output).toBe(" Mittwoch 03. Juli 2024\n");
});
