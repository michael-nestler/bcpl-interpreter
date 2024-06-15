import { STRINGS_ADDRESS_SPACE } from "../constants";
import { Program } from "../program";

export function writef(args: Int32Array, program: Program) {
  const stringRef = args[0];
  const formatString = program.environment.strings.get((stringRef | 0) - (STRINGS_ADDRESS_SPACE | 0));
  if (!formatString) {
    console.error("writef(...) call invoked with invalid string reference", stringRef);
    return false;
  }
  let formattedString = "";
  let argumentOffset = 0;
  for (let i = 0; i < formatString.length; i++) {
    switch (formatString.charAt(i)) {
      case "%":
        switch (formatString.charAt(++i)) {
          case "%":
            formattedString += "%";
            break;
          case "i": {
            const width = Number(formatString.charAt(++i));
            if (!Number.isSafeInteger(width)) {
              console.log("Invalid format substitution", "%", "i", formatString.charAt(i));
              return false;
            }
            formattedString += args[++argumentOffset].toString().padStart(width);
            break;
          }
          case "n": {
            formattedString += args[++argumentOffset].toString();
            break;
          }
          case "c": {
            formattedString += String.fromCharCode(args[++argumentOffset]);
            break;
          }
          case "s":
          case "S": {
            const strRef = program.environment.stack[args[++argumentOffset]];
            const str =
              program.environment.strings.get((strRef - STRINGS_ADDRESS_SPACE) | 0) ||
              program.environment.strings.get((args[argumentOffset] | 0) - (STRINGS_ADDRESS_SPACE | 0));
            if (str === undefined) {
              console.log("Invalid str ref for %%s substitution", strRef);
              return false;
            }
            formattedString += str;
            break;
          }
          default:
            console.log("Invalid format substitution", "%", formatString.charAt(i));
            return false;
        }
        break;
      default:
        formattedString += formatString.charAt(i);
    }
  }
  program.output += formattedString;
  console.log("[stdout]", formattedString);
  return true;
}
