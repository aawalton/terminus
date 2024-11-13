import { getFibonacci, toDecimal, toCanonical } from './numbers.js';

// Replace static array with generated test cases
const testCases = Array.from({ length: 100 }, (_, i) => {
  const decimal = i + 1;
  const canonical = toCanonical(decimal);
  return [decimal, canonical];
});

describe('getFibonacci', () => {
  test('returns correct Fibonacci numbers', () => {
    expect(getFibonacci(0)).toBe(0);
    expect(getFibonacci(1)).toBe(1);
    expect(getFibonacci(2)).toBe(2);
    expect(getFibonacci(3)).toBe(3);
    expect(getFibonacci(4)).toBe(5);
    expect(getFibonacci(5)).toBe(8);
    expect(getFibonacci(6)).toBe(13);
    expect(getFibonacci(7)).toBe(21);
  });
});

describe('toCanonical and toDecimal comprehensive tests', () => {
  test.each(testCases)('converts decimal %i to canonical %s', (decimal, canonical) => {
    expect(toCanonical(decimal)).toBe(canonical);
  });

  test.each(testCases)('converts canonical %s to decimal %i', (decimal, canonical) => {
    expect(toDecimal(canonical)).toBe(decimal);
  });

  test.each(testCases)('roundtrip: toDecimal(toCanonical(%i)) === %i', (decimal) => {
    expect(toDecimal(toCanonical(decimal))).toBe(decimal);
  });
}); 