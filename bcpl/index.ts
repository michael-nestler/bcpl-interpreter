import { STATIC_ADDRESS_SPACE } from "./constants";
import { Operation } from "./operations/operations";
import { parseCode } from "./parser/parser";
import { Program } from "./program";

export { Program };

export function loadProgram(ocodeSrc: string, args = "", input = ""): [Program, string] {
  const { commands, styledHtml } = parseCode(ocodeSrc);

  const program = new Program();
  program.commands = commands;
  program.arguments = args;
  program.input = input;
  let staticVariables = 0;
  commands.forEach((command, index) => {
    if (command.operation === Operation.LAB || command.operation === Operation.ENTRY) {
      program.labels.set(command.arguments[0], index);
    } else if (command.operation === Operation.DATALAB) {
      program.labels.set(command.arguments[0], STATIC_ADDRESS_SPACE + staticVariables);
    } else if (command.operation === Operation.ITEMN) {
      program.environment.setStaticVariable(staticVariables, command.arguments[0]);
      staticVariables++;
    } else if (command.operation === Operation.LSTR) {
      const address = program.putString(command.arguments);
      program.stringAddresses.set(index, address);
    } else if (command.operation === Operation.GLOBAL) {
      const labelIndex = command.arguments.slice(1).findIndex((value, index) => value === 1 && index % 2 === 0);
      for (let i = 1; i < command.arguments.length - 1; i += 2) {
        program.environment.setGlobalVariable(command.arguments[i], program.resolveLabel(command.arguments[i + 1]));
      }
      if (labelIndex !== -1) {
        program.start = program.resolveLabel(command.arguments[labelIndex + 2]);
        program.startup();
      } else {
        console.log("Encountered GLOBAL without entry at index 1");
      }
    }
  });
  return [program, styledHtml];
}
