import { isDerivedFrom } from './derivations';

describe('isDerivedFrom', () => {
  // Valid derivations from documentation
  test('6 is derived from 13', () => {
    expect(isDerivedFrom(6, 13)).toBe(true); g
  });

  test('5 is derived from 8', () => {
    expect(isDerivedFrom(5, 8)).toBe(true);
  });

  test('8 is derived from 34', () => {
    expect(isDerivedFrom(8, 34)).toBe(true);
  });

  // Invalid derivations from documentation
  test('3 is not derived from 13', () => {
    expect(isDerivedFrom(3, 13)).toBe(false);
  });

  test('6 is not derived from 16', () => {
    expect(isDerivedFrom(6, 16)).toBe(false);
  });

  test('7 is not derived from 13', () => {
    expect(isDerivedFrom(7, 13)).toBe(false);
  });

  // Multiple derivation paths
  test('5 is derived from multiple numbers', () => {
    expect(isDerivedFrom(5, 8)).toBe(true);   // from ((4))
    expect(isDerivedFrom(5, 13)).toBe(true);  // from ((4)1)
    expect(isDerivedFrom(5, 21)).toBe(true);  // from ((4)2)
    expect(isDerivedFrom(5, 34)).toBe(true);  // from (((4)))
  });

  // Edge cases
  test('number is not derived from itself', () => {
    expect(isDerivedFrom(5, 5)).toBe(false);
  });

  test('number is not derived from smaller numbers', () => {
    expect(isDerivedFrom(8, 5)).toBe(false);
  });

  test('handles single digit numbers', () => {
    expect(isDerivedFrom(1, 13)).toBe(false);
    expect(isDerivedFrom(2, 21)).toBe(false);
    expect(isDerivedFrom(3, 34)).toBe(false);
    expect(isDerivedFrom(4, 42)).toBe(false);
  });
});
