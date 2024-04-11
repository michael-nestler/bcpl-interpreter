import { removePrefix, substringBefore } from "../../str-utils";
import type { Command } from "../command";
import { type Op, operations } from "../operations/operations";

export function parseCode(text: string): Command[] {
  return text
    .split("\n")
    .map((line) => substringBefore(line, "#").trim())
    .filter((line) => line.length > 0)
    .map((line) => parseCommand(line))
    .flatMap((command) => (command ? [command] : []));
}

function parseCommand(line: string): Command {
  const fragments = line.split(" ");
  const commandName = fragments[0];
  if (!(commandName in operations)) {
    throw new Error(`Unknown command: ${line}`);
  }
  return { operation: commandName as Op, arguments: fragments.slice(1).map(parseArgument) };
}

function parseArgument(argument: string): number {
  const number = Number(removePrefix(argument, "L"));
  if (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3) {
    return argument[1].charCodeAt(0);
  }
  if (Number.isNaN(number)) {
    console.warn(`Invalid argument: ${argument}`);
    return 0;
  }
  return number;
}
