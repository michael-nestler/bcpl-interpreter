import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("factorial", async () => {
  const program = await runCode("./factorial.ocode");
  expect(program.environment.topValue()).toBe(5040);
});
