import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("function-call", async () => {
  const program = await runCode("./function-call.ocode");
  expect(program.environment.stack).toEqual([9, 418]);
});
