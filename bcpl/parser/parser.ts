import { removePrefix } from "../../str-utils";
import type { Command } from "../command";
import { type Op, operations } from "../operations/operations";

export function parseCode(text: string): Command[] {
  const commands: Command[] = [];
  let comment = false;
  let line = 1;
  let column = 1;
  let currentToken = "";
  let currentCommand: Command | null = null;
  let lastCharacter: [number, number] = [1, 1];
  let quotes = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "#") {
      comment = true;
      continue;
    }
    if (text[i] === "\n") {
      comment = false;
    }
    if (comment) {
      continue;
    }
    if (quotes % 2 === 0 && text[i].trim().length === 0) {
      if (currentToken) {
        if (currentCommand) {
          if (isArgument(currentToken)) {
            currentCommand.arguments.push(parseArgument(currentToken));
            lastCharacter = [line, column - 1];
          } else {
            currentCommand.end = lastCharacter;
            commands.push(currentCommand);
            if (!(currentToken in operations)) {
              throw new Error(`Unknown command: ${currentToken}, line ${line}, column ${column}`);
            }
            currentCommand = { operation: currentToken as Op, arguments: [], start: [line, column - currentToken.length], end: [-1, -1] };
            lastCharacter = [line, column - 1];
          }
        } else {
          if (!(currentToken in operations)) {
            throw new Error(`Unknown command: ${currentToken}, line ${line}, column ${column}`);
          }
          currentCommand = { operation: currentToken as Op, arguments: [], start: [line, column - currentToken.length], end: [-1, -1] };
          lastCharacter = [line, column - 1];
        }
        currentToken = "";
      }
      if (text[i] === "\n") {
        line++;
        column = 1;
        quotes = 0;
      } else {
        column++;
      }
      continue;
    }
    if (text[i] === "'") {
      quotes++;
    }
    currentToken += text[i];
    column++;
  }
  if (currentToken) {
    lastCharacter = [line, column - 1];
  }
  if (currentCommand) {
    currentCommand.end = lastCharacter;
    commands.push(currentCommand);
  }
  return commands;
}

function parseArgument(argument: string): number {
  if (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3) {
    return argument[1].charCodeAt(0);
  }
  const number = Number(removePrefix(argument, "L"));
  if (!Number.isSafeInteger(number)) {
    console.warn(`Invalid argument: ${argument}`);
    return 0;
  }
  return number;
}

function isArgument(argument: string) {
  return (
    Number.isSafeInteger(Number(removePrefix(argument, "L"))) ||
    (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3)
  );
}
