import type { Environment } from "../environment";

export function setStackOffset(env: Environment, value: number) {
  for (let i = env.currentOffset; i < value; i++) {
    env.stack[env.framePointer + i] = 0;
  }
  env.currentOffset = value;
}
