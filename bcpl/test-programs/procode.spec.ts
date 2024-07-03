import { expect, test } from "bun:test";
import { loadFile, runCode } from "./testing";

test("procode", async () => {
  const program = await runCode("./procode.ocode", { stdin: await loadFile("./procode.bin") });
  expect(program.output).toBe(`Converting  to *
${(await loadFile("./procode.ocode")).replaceAll("\r", "")}Conversion complete
`);
});
