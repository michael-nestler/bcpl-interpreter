import { STATIC_ADDRESS_SPACE } from "./constants";
import { parseCode } from "./parser/parser";
import { Program } from "./program";

export { Program } from "./program";

export function loadProgram(ocodeSrc: string, args: string = "", input: string = ""): [Program, string] {
  const { commands, styledHtml } = parseCode(ocodeSrc);

  const program = new Program();
  program.commands = commands;
  program.arguments = args;
  program.input = input;
  commands.forEach((command, index) => {
    if (command.operation === "LAB" || command.operation === "ENTRY") {
      program.labels.set(command.arguments[0], index);
    } else if (command.operation === "DATALAB") {
      program.labels.set(command.arguments[0], STATIC_ADDRESS_SPACE + program.environment.staticVariables.length);
    } else if (command.operation === "ITEMN") {
      program.environment.staticVariables.push(command.arguments[0]);
    }
  });
  if (["ENTRY", "SECTION"].includes(commands[0]?.operation)) {
    program.programCounter = commands.length - 1;
  }
  return [program, styledHtml];
}
