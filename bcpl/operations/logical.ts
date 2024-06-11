import type { Environment } from "../environment";

export function leftShift(env: Environment) {
  env.diadicOperation((a, b) => b >= 32 ? 0 : a << b);
}

export function rightShift(env: Environment) {
  env.diadicOperation((a, b) => b >= 32 ? 0 : a >> b);
}

export function logicalAnd(env: Environment) {
  env.diadicOperation((a, b) => a & b);
}

export function logicalOr(env: Environment) {
  env.diadicOperation((a, b) => a | b);
}

export function logicalNot(env: Environment) {
  env.monadicOperation((a) => ~a);
}

export function bitwiseEquality(env: Environment) {
  env.diadicOperation((a, b) => ~a ^ b);
}

export function bitwiseInequality(env: Environment) {
  env.diadicOperation((a, b) => a ^ b);
}
