import { expect, test } from "bun:test";
import { runCode } from "./testing";

test("enlarge", async () => {
  const program = await runCode("./enlarge.ocode", { arguments: "Test" });
  expect(program.output.trim()).toBe(`
                     ########  ########   ######   ######## 
                     ########  ########  ########  ######## 
                        ##     ##        ##           ##    
                        ##     ######    #######      ##    
                        ##     ##              ##     ##    
                        ##     ##              ##     ##    
                        ##     ########  ########     ##    
                        ##     ########   ######      ##`.trim());
});
