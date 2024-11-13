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
    expect(getFibonacci(9)).toBe(55);
    expect(getFibonacci(10)).toBe(89);
  });

  test('handles large indices correctly', () => {
    expect(getFibonacci(12)).toBe(233);
    expect(getFibonacci(15)).toBe(987);
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
    expect(toDecimal('((4))4')).toBe(12); // 8 + 4
  });

  test('converts complex expressions', () => {
    expect(toDecimal('((4)1)')).toBe(13);     // 7th Fibonacci
    expect(toDecimal('((4)2)')).toBe(21);     // 8th Fibonacci
    expect(toDecimal('((4)1)(4)')).toBe(18);  // 13 + 5
    expect(toDecimal('((4)2)((4))')).toBe(29); // 21 + 8
  });

  test('handles multiple adjacent numbers', () => {
    expect(toDecimal('(4)12')).toBe(17);  // 5 + 12
    expect(toDecimal('((4))12')).toBe(20); // 8 + 12
  });

  test('handles nested expressions with multiple components', () => {
    expect(toDecimal('((4)1)(4)2')).toBe(20);  // 13 + 5 + 2
    expect(toDecimal('((4)2)((4))1')).toBe(30); // 21 + 8 + 1
    expect(toDecimal('(((4)))((4)1)')).toBe(47); // 34 + 13
  });

  test('handles empty or invalid input', () => {
    expect(toDecimal('')).toBe(0);
    expect(toDecimal(null)).toBe(0);
    expect(toDecimal(undefined)).toBe(0);
    expect(toDecimal('()')).toBe(0);
  });

  test('handles malformed expressions gracefully', () => {
    expect(toDecimal('(')).toBe(0);
    expect(toDecimal(')')).toBe(0);
    expect(toDecimal('(4')).toBe(0);
    expect(toDecimal('4)')).toBe(4);
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
    expect(toCanonical(55)).toBe('(((4)1))');
  });

  test('prefers largest possible prefix in composite representations', () => {
    expect(toCanonical(6)).toBe('(4)1');    // 5 + 1
    expect(toCanonical(7)).toBe('(4)2');    // 5 + 2
    expect(toCanonical(18)).toBe('((4)1)(4)'); // 13 + 5
    expect(toCanonical(29)).toBe('((4)2)((4))'); // 21 + 8
    expect(toCanonical(35)).toBe('(((4)))1'); // 34 + 1
  });

  test('handles numbers requiring multiple components', () => {
    expect(toCanonical(19)).toBe('((4)1)(4)1'); // 13 + 5 + 1
    expect(toCanonical(30)).toBe('((4)2)((4))1'); // 21 + 8 + 1
    expect(toCanonical(47)).toBe('(((4)))((4)1)'); // 34 + 13
  });

  test('maintains canonical form for complex numbers', () => {
    const testCases = [6, 7, 18, 29, 34, 47, 55, 89];
    for (const num of testCases) {
      const canonical = toCanonical(num);
      expect(toDecimal(canonical)).toBe(num);
      expect(toCanonical(toDecimal(canonical))).toBe(canonical);
    }
  });

  test('handles edge cases correctly', () => {
    expect(toCanonical(0)).toBe('0');
    expect(toCanonical(100)).toBe('(((4)2))((4)1)'); // 89 + 11
    expect(toCanonical(144)).toBe('((((4))))'); // Pure Fibonacci
  });

  test('verifies bidirectional conversion for a range of numbers', () => {
    for (let i = 1; i <= 50; i++) {
      const canonical = toCanonical(i);
      const decimal = toDecimal(canonical);
      expect(decimal).toBe(i);
      expect(toCanonical(decimal)).toBe(canonical);
    }
  });
});
