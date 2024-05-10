import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("writef", async () => {
  const program = await runCode("./writef.ocode");
  expect(program.output).toBe("Answer is 0\n");
});
