import { isDerivedFrom, findParents, findAncestors } from './derivations';

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

describe('findParents', () => {
  // Base cases
  test('numbers 1-4 have no parents', () => {
    expect(findParents(1)).toEqual([]);
    expect(findParents(2)).toEqual([]);
    expect(findParents(3)).toEqual([]);
    expect(findParents(4)).toEqual([]);
  });

  test('5 has exactly one parent: 4', () => {
    expect(findParents(5)).toEqual([4]);
  });

  // Form (A)B parents
  test('6 = (4)1 has parents [1, 5]', () => {
    expect(findParents(6)).toEqual([5, 1]);
  });

  test('12 = ((4))4 has parents [4, 8]', () => {
    expect(findParents(12)).toEqual([8, 4]);
  });

  // Form (A) parents
  test('8 = ((4)) has parents [5, 5]', () => {
    expect(findParents(8)).toEqual([5, 5]);
  });

  test('13 = ((4)1) has parents [5, 6]', () => {
    expect(findParents(13)).toEqual([6, 5]);
  });

  test('34 = (((4))) has parents [5, 8]', () => {
    expect(findParents(34)).toEqual([8, 5]);
  });
});

describe('Parent and Ancestor relationships', () => {
  test('finds direct parents of 8', () => {
    const parents = findParents(8);
    expect(parents).toEqual([5, 5]);
  });

  test('finds direct parents of 13', () => {
    const parents = findParents(13);
    expect(parents).toEqual([6, 5]);
  });

  test('finds all ancestors of 8', () => {
    const ancestors = findAncestors(8);
    expect(ancestors).toEqual([4, 5]); // 8 ((4)) can be derived from 4 and 5
  });

});
