import { getFibonacci, toDecimal, toCanonical } from '../numbers.js';

describe('getFibonacci', () => {
  test('returns correct Fibonacci numbers for small indices', () => {
    expect(getFibonacci(0)).toBe(0);
    expect(getFibonacci(1)).toBe(1);
    expect(getFibonacci(2)).toBe(1);
    expect(getFibonacci(3)).toBe(2);
    expect(getFibonacci(4)).toBe(3);
    expect(getFibonacci(5)).toBe(5);
  });

  test('handles larger indices', () => {
    expect(getFibonacci(10)).toBe(55);
    expect(getFibonacci(20)).toBe(6765);
  });
});

describe('toDecimal', () => {
  test('converts simple digits', () => {
    expect(toDecimal('0')).toBe(0);
    expect(toDecimal('4')).toBe(4);
    expect(toDecimal('42')).toBe(6);
  });

  test('converts Fibonacci representations', () => {
    expect(toDecimal('(2)')).toBe(1);
    expect(toDecimal('(3)')).toBe(2);
    expect(toDecimal('(4)')).toBe(3);
  });

  test('converts complex expressions', () => {
    expect(toDecimal('(5)1')).toBe(6);
    expect(toDecimal('(6)')).toBe(8);
    expect(toDecimal('(4)2')).toBe(5);
  });

  test('handles nested expressions', () => {
    expect(toDecimal('((2))')).toBe(1);
    expect(toDecimal('((3))')).toBe(2);
    expect(toDecimal('((4)1)')).toBe(5);
  });
});

describe('toCanonical', () => {
  test('converts small numbers', () => {
    expect(toCanonical(0)).toBe('0');
    expect(toCanonical(1)).toBe('1');
    expect(toCanonical(2)).toBe('2');
    expect(toCanonical(3)).toBe('3');
    expect(toCanonical(4)).toBe('4');
  });

  test('converts Fibonacci numbers', () => {
    expect(toCanonical(5)).toBe('(4)');
    expect(toCanonical(8)).toBe('(6)');
    expect(toCanonical(13)).toBe('(7)');
  });

  test('converts complex numbers', () => {
    expect(toCanonical(6)).toBe('(4)2');
    expect(toCanonical(7)).toBe('(4)3');
    expect(toCanonical(9)).toBe('(6)1');
  });

  test('property: toDecimal(toCanonical(n)) === n', () => {
    const testValues = [0, 1, 5, 8, 13, 21, 34, 55];
    for (const n of testValues) {
      expect(toDecimal(toCanonical(n))).toBe(n);
    }
  });
}); 