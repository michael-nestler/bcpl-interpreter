import { removePrefix } from "../../str-utils";
import type { Command } from "../command";
import { type Op, operations } from "../operations/operations";

export interface ParsedProgram {
  commands: Command[];
  styledHtml: string;
}

export function parseCode(text: string): ParsedProgram {
  const commands: Command[] = [];
  let styledHtml = "<table><tr><td><input class='breakpoint' type='checkbox' data-linenumber='1'></td><td class='linenumber'>1</td><td>";
  let comment = false;
  let line = 1;
  let column = 1;
  let currentToken = "";
  let currentCommand: Command | null = null;
  let lastCharacter: [number, number] = [1, 1];
  let quotes = 0;
  const normalizedText = `${text}\n`;
  for (let i = 0; i < normalizedText.length; i++) {
    if (
      normalizedText[i] === "#" &&
      !quotes &&
      !(
        normalizedText[i + 1] &&
        ((normalizedText[i + 1] >= "0" && normalizedText[i + 1] <= "9") || (normalizedText[i + 1] >= "A" && normalizedText[i + 1] <= "Z"))
      )
    ) {
      comment = true;
      styledHtml += "<span class='comment'>#";
      continue;
    }
    if (normalizedText[i] === "\n") {
      if (comment) {
        styledHtml += "</span>";
      }
      comment = false;
    }
    if (comment) {
      styledHtml += normalizedText[i];
      continue;
    }
    if ((!quotes || quotes >= 2) && normalizedText[i].trim().length === 0) {
      if (currentToken) {
        if (currentCommand) {
          if (isArgument(currentToken)) {
            currentCommand.arguments.push(parseArgument(currentToken));
            lastCharacter = [line, column - 1];
            styledHtml += `<span class='command-arg command-arg-${argType(currentToken)}'>${currentToken}</span>`;
          } else {
            currentCommand.end = lastCharacter;
            commands.push(currentCommand);
            if (!(currentToken in operations)) {
              throw new Error(`Unknown command: ${currentToken}, line ${line}, column ${column}`);
            }
            currentCommand = { operation: currentToken as Op, arguments: [], start: [line, column - currentToken.length], end: [-1, -1] };
            lastCharacter = [line, column - 1];
            styledHtml += "</span>";
            styledHtml += `<span class='command command-${commands.length}'><span class='command-op'>${currentToken}</span>`;
          }
        } else {
          if (!(currentToken in operations)) {
            throw new Error(`Unknown command: ${currentToken}, line ${line}, column ${column}`);
          }
          currentCommand = { operation: currentToken as Op, arguments: [], start: [line, column - currentToken.length], end: [-1, -1] };
          lastCharacter = [line, column - 1];
          styledHtml += `<span class='command command-${commands.length}'><span class='command-op'>${currentToken}</span>`;
        }
        currentToken = "";
        quotes = 0;
      }
      styledHtml += normalizedText[i];
      if (normalizedText[i] === "\n") {
        line++;
        column = 1;
        quotes = 0;
        if (i === normalizedText.length - 1) {
          styledHtml += "</td></tr></table>";
        } else {
          styledHtml += `</td></tr><tr><td><input class='breakpoint' type='checkbox' data-linenumber='${line}'></td><td class='linenumber'>${line}</td><td>`;
        }
      } else {
        column++;
      }
      continue;
    }
    currentToken += normalizedText[i];
    column++;
    if (normalizedText[i] === "'") {
      quotes++;
    }
  }
  if (currentCommand) {
    currentCommand.end = lastCharacter;
    commands.push(currentCommand);
  }
  return { commands, styledHtml };
}

function parseArgument(argument: string): number {
  if (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3) {
    return argument[1].charCodeAt(0);
  }
  if (argument.startsWith("#")) {
    return Number.parseInt(removePrefix(argument, "#"), 16) | 0;
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
    (argument.startsWith("#") && Number.isSafeInteger(Number.parseInt(removePrefix(argument, "#"), 16))) ||
    (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3)
  );
}

function argType(argument: string) {
  if (argument.startsWith("L") && Number.isSafeInteger(Number(removePrefix(argument, "L")))) {
    return "label";
  }
  if (Number.isSafeInteger(Number.parseInt(removePrefix(argument, "#"), 16))) {
    return "number";
  }
  if (argument.startsWith("'") && argument.endsWith("'") && argument.length === 3) {
    return "char";
  }
  return "unknown";
}
