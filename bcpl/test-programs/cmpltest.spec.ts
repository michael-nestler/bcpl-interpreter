import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("cmpltest", async () => {
  const program = await runCode("./cmpltest.ocode");
  expect(program.output).toStartWith(`XYZ
ABCD
07FF
1235
ABCD

Cmpltest running on a little ender machine
The BCPL word is 32 bits long

XXX`);
  expect(program.output.trim()).toEndWith("618 TESTS COMPLETED, 0 FAILURE(S)");
});
