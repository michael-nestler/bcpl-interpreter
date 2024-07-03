import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("sudoku", async () => {
  const problem = `
000638000 706000305 010000040
008712400 090000050 002569100
030000010 105000608 000184000`.trim().replaceAll("\n", " ");
  const program = await runCode("./sudoku.ocode", { arguments: problem });
  expect(program.output.trim()).toEndWith(`
Solution number 1

5 2 4   6 3 8   9 7 1
7 8 6   4 9 1   3 2 5
9 1 3   2 7 5   8 4 6

3 5 8   7 1 2   4 6 9
6 9 1   8 4 3   7 5 2
4 7 2   5 6 9   1 8 3

8 3 7   9 5 6   2 1 4
1 4 5   3 2 7   6 9 8
2 6 9   1 8 4   5 3 7



Total number of solutions: 1`);
});
