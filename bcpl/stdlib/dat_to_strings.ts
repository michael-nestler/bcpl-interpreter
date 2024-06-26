import { Program } from "../program";
import { MILLISECONDS_IN_DAY } from "./datstamp";

export function dat_to_strings(args: Int32Array, program: Program) {
  const timestampAddress = args[0];
  const resultVectorAddress = args[1];
  const daysSinceEpoch = program.environment.stack[timestampAddress];
  const millisSinceMidnight = program.environment.stack[timestampAddress + 1];
  const date = new Date(daysSinceEpoch * MILLISECONDS_IN_DAY + millisSinceMidnight);
  const dateStr = date.toLocaleDateString("de", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("de");
  const dayOfWeekStr = date.toLocaleDateString("de", { weekday: "long" });
  program.putByte(resultVectorAddress, 0, dateStr.length);
  for (let i = 0; i < dateStr.length; i++) {
    program.putByte(resultVectorAddress, i + 1, dateStr.charCodeAt(i));
  }
  program.putByte(resultVectorAddress + 5, 0, timeStr.length);
  for (let i = 0; i < timeStr.length; i++) {
    program.putByte(resultVectorAddress + 5, i + 1, timeStr.charCodeAt(i));
  }
  program.putByte(resultVectorAddress + 10, 0, dayOfWeekStr.length);
  for (let i = 0; i < dayOfWeekStr.length; i++) {
    program.putByte(resultVectorAddress + 10, i + 1, dayOfWeekStr.charCodeAt(i));
  }
  return true;
}
