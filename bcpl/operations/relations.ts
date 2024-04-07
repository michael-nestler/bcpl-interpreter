import { booleanToConstant } from "../constants";
import type { Environment } from "../environment";

export function equality(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a === b));
}

export function inequality(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a !== b));
}

export function lessThan(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a < b));
}

export function greaterThan(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a > b));
}

export function lessThanOrEqualTo(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a <= b));
}

export function greaterThanOrEqualTo(env: Environment) {
    env.diadicOperation((a, b) => booleanToConstant(a >= b));
}
