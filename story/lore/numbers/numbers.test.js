import { getFibonacci, toDecimal, toCanonical } from './numbers.js';

describe('getFibonacci', () => {
  test('returns correct Fibonacci numbers for base cases', () => {
    expect(getFibonacci(0)).toBe(0);
    expect(getFibonacci(1)).toBe(1);
    expect(getFibonacci(2)).toBe(2);
  });

  test('returns correct Fibonacci numbers for n > 2', () => {
    expect(getFibonacci(3)).toBe(3);
    expect(getFibonacci(4)).toBe(5);
    expect(getFibonacci(5)).toBe(8);
    expect(getFibonacci(6)).toBe(13);
    expect(getFibonacci(7)).toBe(21);
    expect(getFibonacci(8)).toBe(34);
  });
});

describe('toDecimal', () => {
  test('converts basic digits 1-4', () => {
    expect(toDecimal('1')).toBe(1);
    expect(toDecimal('2')).toBe(2);
    expect(toDecimal('3')).toBe(3);
    expect(toDecimal('4')).toBe(4);
  });

  test('converts simple Fibonacci expressions', () => {
    expect(toDecimal('(4)')).toBe(5);    // 5th Fibonacci
    expect(toDecimal('((4))')).toBe(8);  // 6th Fibonacci
    expect(toDecimal('(((4)))')).toBe(34); // 8th Fibonacci
  });

  test('converts expressions with adjacent numbers', () => {
    expect(toDecimal('(4)1')).toBe(6);   // 5 + 1
    expect(toDecimal('(4)2')).toBe(7);   // 5 + 2
    expect(toDecimal('((4))1')).toBe(9); // 8 + 1
  });

  test('converts complex expressions', () => {
    expect(toDecimal('((4)1)')).toBe(13);     // 7th Fibonacci
    expect(toDecimal('((4)2)')).toBe(21);     // 8th Fibonacci
    expect(toDecimal('((4)1)(4)')).toBe(18);  // 13 + 5
  });

  test('handles empty or invalid input', () => {
    expect(toDecimal('')).toBe(0);
    expect(toDecimal(null)).toBe(0);
  });
});

describe('toCanonical', () => {
  test('returns direct representation for numbers 1-4', () => {
    expect(toCanonical(1)).toBe('1');
    expect(toCanonical(2)).toBe('2');
    expect(toCanonical(3)).toBe('3');
    expect(toCanonical(4)).toBe('4');
  });

  test('converts to pure Fibonacci representation when exact', () => {
    expect(toCanonical(5)).toBe('(4)');
    expect(toCanonical(8)).toBe('((4))');
    expect(toCanonical(13)).toBe('((4)1)');
    expect(toCanonical(21)).toBe('((4)2)');
    expect(toCanonical(34)).toBe('(((4)))');
  });

  test('prefers largest possible prefix in composite representations', () => {
    expect(toCanonical(6)).toBe('(4)1');    // 5 + 1
    expect(toCanonical(7)).toBe('(4)2');    // 5 + 2
    expect(toCanonical(18)).toBe('((4)1)(4)'); // 13 + 5
    expect(toCanonical(29)).toBe('((4)2)((4))'); // 21 + 8
  });

  test('maintains canonical form for complex numbers', () => {
    // Convert back and forth to verify canonical form
    const testCases = [6, 7, 18, 29, 34];
    for (const num of testCases) {
      const canonical = toCanonical(num);
      expect(toDecimal(canonical)).toBe(num);
      // Converting the number again should yield the same canonical form
      expect(toCanonical(toDecimal(canonical))).toBe(canonical);
    }
  });
});
