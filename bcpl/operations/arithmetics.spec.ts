import { beforeEach, describe, expect, test } from "bun:test";
import { Environment } from "../environment";
import { divide, minus, multiply, negate, plus, remainder } from "./arithmetics";

describe("arithmetics operations", () => {
  const environment = new Environment();

  beforeEach(() => environment.clear());

  test("multiply", () => {
    environment.push(0b1110001100010001);
    environment.push(3234);
    multiply(environment);

    expect(environment.topValue()).toBe(0b0111110011000010);
  });

  test("divide", () => {
    environment.push(0b0111110011000010);
    environment.push(9);
    divide(environment);

    expect(environment.topValue()).toBe(0b0000110111011100);
  });

  test("remainder", () => {
    environment.push(0b0111110011000010);
    environment.push(9);
    remainder(environment);

    expect(environment.topValue()).toBe(0b0000000000000110);
  });

  test("plus", () => {
    environment.push(0b1110001100010001);
    environment.push(0b0111110011000010);
    plus(environment);

    expect(environment.topValue()).toBe(0b0101111111010011);
  });

  test("minus", () => {
    environment.push(0b1110001100010001);
    environment.push(0b0111110011000010);
    minus(environment);

    expect(environment.topValue()).toBe(0b0110011001001111);
  });

  test("negate", () => {
    environment.push(0b0110011001001111);
    negate(environment);

    expect(environment.topValue()).toBe(0b1001100110110001);
  });
});
