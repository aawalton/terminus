import { findDerivations, generateDerivations } from './derivations.js';

describe('findDerivations', () => {
  test('finds all valid substrings that represent numbers', () => {
    expect(findDerivations('1')).toEqual([1]);
    expect(findDerivations('12')).toEqual([1, 2]);
    expect(findDerivations('(4)')).toEqual([4, 5]);
    expect(findDerivations('(4)1')).toEqual([1, 4, 5, 6]);
    expect(findDerivations('((4))')).toEqual([4, 5, 8]);
  });

  test('handles empty or invalid input', () => {
    expect(findDerivations('')).toEqual([]);
    expect(findDerivations('(')).toEqual([]);
    expect(findDerivations(')')).toEqual([]);
    expect(findDerivations('()')).toEqual([]);
  });

  test('handles complex nested expressions', () => {
    expect(findDerivations('((4)1)(4)')).toEqual([
      1, 4, 5, 6, 13, 18
    ]);
  });

  test('only includes each number once', () => {
    // '44' should only include 4 once
    expect(findDerivations('44')).toEqual([4]);
  });
});

describe('generateDerivations', () => {
  test('generates derivations for first few numbers', () => {
    const results = generateDerivations(5);

    expect(results).toEqual({
      1: {
        representation: '1',
        derivedFrom: []
      },
      2: {
        representation: '2',
        derivedFrom: []
      },
      3: {
        representation: '3',
        derivedFrom: []
      },
      4: {
        representation: '4',
        derivedFrom: []
      },
      5: {
        representation: '(4)',
        derivedFrom: [4]
      }
    });
  });

  test('handles a more complex number', () => {
    const results = generateDerivations(8);

    // Let's specifically check number 8
    expect(results[8]).toEqual({
      representation: '((4))',
      derivedFrom: [4, 5]
    });
  });

  test('handles invalid input', () => {
    expect(generateDerivations(0)).toEqual({});
    expect(generateDerivations(-1)).toEqual({});
  });
});

// Note: We don't test generateNumbersJson directly since it involves file I/O
// Instead, we test the functions it uses (generateDerivations) 