import { Program } from "../program";

export function writef(args: Int32Array, program: Program) {
  const stringRef = args[0];
  const formatString = program.getString(stringRef);
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
            const strRef = args[++argumentOffset];
            const str = program.getString(strRef);
            if (str === undefined) {
              console.log("Invalid str ref for %%s substitution", strRef);
              return false;
            }
            formattedString += str;
            break;
          }
          default:
            if (formatString.charAt(i).charCodeAt(0) >= "0".charCodeAt(0) && formatString.charAt(i).charCodeAt(0) <= "9".charCodeAt(0)) {
              const n = formatString.charAt(i).charCodeAt(0) - "0".charCodeAt(0);
              if (formatString.charAt(++i) === "x") {
                // >>> 0 will convert negative numbers into the equivalent positive number so that their hex representation matches
                formattedString += (args[++argumentOffset] >>> 0).toString(16).padStart(n, "0").toUpperCase();
                break;
              }
            }
            console.log("Invalid format substitution", "%", formatString.charAt(i));
            return false;
        }
        break;
      default:
        formattedString += formatString.charAt(i);
    }
  }
  program.output += formattedString;
  if (program.printOut) {
    console.log("[stdout]", formattedString);
  }
  return true;
}
