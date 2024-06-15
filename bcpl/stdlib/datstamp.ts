import { Program } from "../program";

export const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

export function datstamp(args: Int32Array, program: Program) {
  const address = args[0];
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / MILLISECONDS_IN_DAY) | 0;
  const millisSinceMidnight = now.getTime() - daysSinceEpoch * MILLISECONDS_IN_DAY;
  program.environment.stack[address] = daysSinceEpoch;
  program.environment.stack[address + 1] = millisSinceMidnight;
  return true;
}
