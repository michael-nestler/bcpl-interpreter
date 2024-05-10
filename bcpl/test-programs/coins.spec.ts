import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("coins", async () => {
  const program = await runCode("./coins.ocode");
  expect(program.output).toBe(
    `Coins problem
Sum =   0 number of ways =      1
Sum =   1 number of ways =      1
Sum =   2 number of ways =      2
Sum =   5 number of ways =      4
Sum =  21 number of ways =     44
Sum = 100 number of ways =   4563
Sum = 200 number of ways =  73682
`,
  );
});
