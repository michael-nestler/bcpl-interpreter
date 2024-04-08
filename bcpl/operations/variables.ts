import type { Environment } from "../environment";

export function loadLocalVariableToStack(env: Environment, variableIndex: number) {
  env.push(env.stack[env.framePointer + variableIndex]);
}

export function saveLocalVariableFromStack(env: Environment, variableIndex: number) {
  env.stack[env.framePointer + variableIndex] = env.pop();
}

export function loadGlobalVariableToStack(env: Environment, variableIndex: number) {
  env.push(env.globalVariables[variableIndex]);
}

export function saveGlobalVariableFromStack(env: Environment, variableIndex: number) {
  env.globalVariables[variableIndex] = env.pop();
}

export function initGlobalVariableToValue(env: Environment, variableIndex: number, value: number) {
  env.globalVariables[variableIndex] = value;
}
