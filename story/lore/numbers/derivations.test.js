import { isDerivedFrom } from './derivations';

describe('isDerivedFrom', () => {
  // Valid derivations from documentation (arguments swapped)
  test('13 is derived from 6', () => {
    expect(isDerivedFrom(13, 6)).toBe(true);
  });

  test('8 is derived from 5', () => {
    expect(isDerivedFrom(8, 5)).toBe(true);
  });

  test('34 is derived from 8', () => {
    expect(isDerivedFrom(34, 8)).toBe(true);
  });

  // Invalid derivations from documentation (arguments swapped)
  test('13 is not derived from 3', () => {
    expect(isDerivedFrom(13, 3)).toBe(false);
  });

  test('16 is derived from 6', () => {
    expect(isDerivedFrom(16, 6)).toBe(true);
  });

  test('13 is not derived from 7', () => {
    expect(isDerivedFrom(13, 7)).toBe(false);
  });

  // Multiple derivation paths (arguments swapped)
  test('larger numbers derived from 5', () => {
    expect(isDerivedFrom(8, 5)).toBe(true);   // from ((4))
    expect(isDerivedFrom(13, 5)).toBe(true);  // from ((4)1)
    expect(isDerivedFrom(21, 5)).toBe(true);  // from ((4)2)
    expect(isDerivedFrom(34, 5)).toBe(true);  // from (((4)))
  });

  // Edge cases (arguments swapped)
  test('number is not derived from itself', () => {
    expect(isDerivedFrom(5, 5)).toBe(false);
  });

  test('smaller numbers are not derived from larger numbers', () => {
    expect(isDerivedFrom(5, 8)).toBe(false);
  });

  test('handles single digit numbers', () => {
    expect(isDerivedFrom(13, 1)).toBe(true);
    expect(isDerivedFrom(21, 2)).toBe(true);
    expect(isDerivedFrom(34, 3)).toBe(false);
    expect(isDerivedFrom(42, 4)).toBe(true);
  });
});
