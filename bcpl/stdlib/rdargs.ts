import { FALSE, STRINGS_ADDRESS_SPACE, TRUE } from "../constants";
import { Program } from "../program";

export function rdargs(args: number[], program: Program): [boolean, number] {
  const argString = program.environment.strings.get((args[0] | 0) - (STRINGS_ADDRESS_SPACE | 0));
  if (!argString) {
    console.warn("rdargs called with unknown string", args[0] | 0);
    return [false, 0];
  }
  const argvPointer = args[1];

  const fragments = argString.split(",");
  const options = fragments.map((fragment) => {
    const aliases = fragment.split("/")[0].split("=");
    const flags = fragment
      .split("/")
      .slice(1)
      .map((flag) => flag.toUpperCase());
    const type = flags.includes("N") ? "number" : flags.includes("S") ? "switch" : "string";
    const isRequired = flags.includes("A") || flags.includes("P");
    const requiresKey = flags.includes("K");
    return { aliases, type, isRequired, requiresKey };
  });
  const remainingOptions = [...options];
  const programArgs = program.arguments.split(" ");
  let numOffset = options.length;
  for (let i = 0; i < program.arguments.split(" ").length; i++) {
    const keywordOption = remainingOptions.find((option) => option.aliases.includes(programArgs[i]));
    keywordOption && ++i;
    if (keywordOption?.type === "switch") {
      program.environment.stack[argvPointer + options.indexOf(keywordOption)] = TRUE | 0;
      remainingOptions.splice(remainingOptions.indexOf(keywordOption), 1);
      continue;
    }
    const option = keywordOption || remainingOptions.find((option) => !option.requiresKey);
    if (option) {
      const value = programArgs[i];
      if (option.type === "number") {
        program.environment.stack[argvPointer + options.indexOf(option)] = argvPointer + numOffset;
        program.environment.stack[argvPointer + numOffset] = Number(value) | 0;
        numOffset++;
      } else {
        const strRef = program.environment.storeString(value);
        program.environment.stack[argvPointer + options.indexOf(option)] = strRef | 0 + STRINGS_ADDRESS_SPACE | 0;
      }
      remainingOptions.splice(remainingOptions.indexOf(option), 1);
    }
  }

  if (remainingOptions.find((option) => option.isRequired)) {
    return [true, FALSE];
  }

  return [true, TRUE];
}
