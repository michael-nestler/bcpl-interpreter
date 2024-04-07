import { beforeEach, test, expect, describe } from 'bun:test';
import { Environment } from '../environment';
import { leftShift, logicalAnd, logicalNot, logicalOr, rightShift } from './logical';

describe('logical operations', () => {
    const environment = new Environment();

    beforeEach(() => environment.clear());

    test('rightShift', () => {
        environment.push(0b1110001100010001);
        environment.push(1);
        rightShift(environment);

        expect(environment.topValue()).toBe(0b0111000110001000);
    });

    test('leftShift', () => {
        environment.push(0b1110001100010001);
        environment.push(4);
        leftShift(environment);

        expect(environment.topValue()).toBe(0b0011000100010000);
    });

    test('logicalOr', () => {
        environment.push(0b0111000110001000);
        environment.push(0b0011010110010010);
        logicalOr(environment);

        expect(environment.topValue()).toBe(0b0111010110011010);
    });

    test('logicalAnd', () => {
        environment.push(0b0111010110011010);
        environment.push(0b0000111001100111);
        logicalAnd(environment);

        expect(environment.topValue()).toBe(0b0000010000000010);
    });

    test('logicalNot', () => {
        environment.push(0b0000010000000010);
        logicalNot(environment);

        expect(environment.topValue()).toBe(0b1111101111111101);
    });
});
