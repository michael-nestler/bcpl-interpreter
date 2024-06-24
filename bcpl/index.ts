import { STATIC_ADDRESS_SPACE } from "./constants";
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
  let currentSection = 0;
  commands.forEach((command, index) => {
    if (command.operation === "SECTION") {
      currentSection = index;
    } else if (command.operation === "LAB" || command.operation === "ENTRY") {
      program.setLabel(currentSection, command.arguments[0], index);
    } else if (command.operation === "DATALAB") {
      program.setLabel(currentSection, command.arguments[0], STATIC_ADDRESS_SPACE + staticVariables);
    } else if (command.operation === "ITEMN") {
      program.environment.setStaticVariable(staticVariables, command.arguments[0]);
      staticVariables++;
    } else if (command.operation === "LSTR") {
      const address = program.putString(command.arguments);
      program.stringAddresses.set(index, address);
    } else if (command.operation === "GLOBAL") {
      const labelIndex = command.arguments.slice(1).findIndex((value, index) => value === 1 && index % 2 === 0);
      for (let i = 1; i < command.arguments.length - 1; i += 2) {
        program.environment.setGlobalVariable(command.arguments[i], program.getLabel(currentSection, command.arguments[i + 1]));
      }
      if (labelIndex !== -1) {
        const returnAddress = -1;
        program.programCounter = program.getLabel(currentSection, command.arguments[labelIndex + 2]);

        program.environment.push(program.environment.framePointer);
        program.environment.push(returnAddress);
        program.environment.push(program.programCounter);
        program.environment.framePointer = program.environment.currentOffset - 3;
        program.environment.currentOffset = 3;
      } else {
        console.log("Encountered GLOBAL without entry at index 1");
      }
    }
  });
  return [program, styledHtml];
}
