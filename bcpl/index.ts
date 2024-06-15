import { STATIC_ADDRESS_SPACE, STRINGS_ADDRESS_SPACE } from "./constants";
import { parseCode } from "./parser/parser";
import { Program } from "./program";

export { Program } from "./program";

export function loadProgram(ocodeSrc: string, args = "", input = ""): [Program, string] {
  const { commands, styledHtml } = parseCode(ocodeSrc);

  const program = new Program();
  program.commands = commands;
  program.arguments = args;
  program.input = input;
  let staticVariables = 0;
  commands.forEach((command, index) => {
    if (command.operation === "LAB" || command.operation === "ENTRY") {
      program.labels.set(command.arguments[0], index);
    } else if (command.operation === "DATALAB") {
      program.labels.set(command.arguments[0], STATIC_ADDRESS_SPACE + staticVariables);
    } else if (command.operation === "ITEMN") {
      program.environment.setStaticVariable(staticVariables, command.arguments[0]);
      staticVariables++;
    } else if (command.operation === "LSTR") {
      const address = program.putString(command.arguments);
      program.stringAddresses.set(index, address);
    }
  });
  if (["ENTRY", "SECTION"].includes(commands[0]?.operation)) {
    program.programCounter = commands.length - 1;
  }
  return [program, styledHtml];
}
