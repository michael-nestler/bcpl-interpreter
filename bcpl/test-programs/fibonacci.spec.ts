import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("fibonacci", async () => {
  const program = await runCode("./fibonacci.ocode");
  expect(program.environment.topValue()).toBe(55);
});
