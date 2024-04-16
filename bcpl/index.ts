import { parseCode } from "./parser/parser";
import { Program } from "./program";

export { Program } from "./program";

export function loadProgram(ocodeSrc: string): Program {
  const commands = parseCode(ocodeSrc);

  const program = new Program();
  program.commands = commands;
  commands.forEach((command, index) => {
    if (command.operation === "LAB" || command.operation === "ENTRY") {
      program.labels.set(command.arguments[0], index);
    }
  });
  return program;
}
