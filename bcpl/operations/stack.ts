import { Environment } from "../environment";

export function setStackOffset(env: Environment, value: number) {
    env.currentOffset = value;
}
