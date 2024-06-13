import { STRINGS_ADDRESS_SPACE } from "../constants";
import { Program } from "../program";
import { MILLISECONDS_IN_DAY } from "./datstamp";

export function dat_to_strings(args: number[], program: Program) {
  const timestampAddress = args[0];
  const resultVectorAddress = args[1];
  const daysSinceEpoch = program.environment.stack[timestampAddress];
  const millisSinceMidnight = program.environment.stack[timestampAddress + 1];
  const date = new Date(daysSinceEpoch * MILLISECONDS_IN_DAY + millisSinceMidnight);
  const dateStr = date.toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("de");
  const dayOfWeekStr = date.toLocaleDateString("de", { weekday: "long" });
  const dateStrRef = program.environment.storeString(dateStr) + STRINGS_ADDRESS_SPACE;
  const timeStrRef = program.environment.storeString(timeStr) + STRINGS_ADDRESS_SPACE;
  const dayOfWeekStrRef = program.environment.storeString(dayOfWeekStr) + STRINGS_ADDRESS_SPACE;
  program.environment.stack[resultVectorAddress] = dateStrRef;
  program.environment.stack[resultVectorAddress + 5] = timeStrRef;
  program.environment.stack[resultVectorAddress + 10] = dayOfWeekStrRef;
  return true;
}
