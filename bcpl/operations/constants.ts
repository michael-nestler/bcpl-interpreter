import { FALSE, TRUE } from "../constants";
import type { Environment } from "../environment";

export function loadValue(env: Environment, value: number) {
  env.push(value);
}

export function loadConstantTrue(env: Environment) {
  env.push(TRUE);
}

export function loadConstantFalse(env: Environment) {
  env.push(FALSE);
}
