import type { Environment } from "../environment";

export function multiply(env: Environment) {
  env.diadicOperation((a, b) => a * b);
}

export function divide(env: Environment) {
  env.diadicOperation((a, b) => Math.trunc(a / b));
}

export function remainder(env: Environment) {
  env.diadicOperation((a, b) => a % b);
}

export function plus(env: Environment) {
  env.diadicOperation((a, b) => a + b);
}

export function minus(env: Environment) {
  env.diadicOperation((a, b) => a - b);
}

export function negate(env: Environment) {
  env.monadicOperation((a) => -a);
}

export function absolute(env: Environment) {
  env.monadicOperation((a) => Math.abs(a | 0) | 0);
}
