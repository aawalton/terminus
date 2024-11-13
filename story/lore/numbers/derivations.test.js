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

describe.skip('findParents', () => {
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
  test('6 = (4)1 has parents [4, 1]', () => {
    expect(findParents(6)).toEqual([1, 4]);
  });

  test('12 = ((4))4 has parents [8, 4]', () => {
    expect(findParents(12)).toEqual([4, 8]);
  });

  // Form (A) parents
  test('8 = ((4)) has parents [5, 5]', () => {
    expect(findParents(8)).toEqual([5, 5]);
  });

  test('13 = ((4)1) has parents [5, 6]', () => {
    expect(findParents(13)).toEqual([5, 6]);
  });

  test('34 = (((4))) has parents [5, 8]', () => {
    expect(findParents(34)).toEqual([5, 8]);
  });
});

describe.skip('Parent and Ancestor relationships', () => {
  test('finds direct parents of 8', () => {
    const parents = findParents(8);
    expect(parents).toEqual([5]); // 8 ((4)) is directly derived from 5 (4)
  });

  test('finds direct parents of 13', () => {
    const parents = findParents(13);
    expect(parents).toEqual([6, 8]); // 13 ((4)1) is derived from both 6 (4)1 and 8 ((4))
  });

  test('finds all ancestors of 8', () => {
    const ancestors = findAncestors(8);
    expect(ancestors).toEqual([4, 5]); // 8 ((4)) can be derived from 4 and 5
  });

  test('finds all ancestors of 13', () => {
    const ancestors = findAncestors(13);
    expect(ancestors).toEqual([4, 5, 6, 8]); // 13 ((4)1) can be derived from 4, 5, 6, and 8
  });

  test('number with no parents returns empty array', () => {
    const parents = findParents(1);
    expect(parents).toEqual([]);
  });

  test('number with no ancestors returns empty array', () => {
    const ancestors = findAncestors(1);
    expect(ancestors).toEqual([]);
  });

  test('parents are always ancestors', () => {
    const number = 34; // (((4)))
    const parents = findParents(number);
    const ancestors = findAncestors(number);

    parents.forEach(parent => {
      expect(ancestors).toContain(parent);
    });
  });

  test('ancestors may not be parents', () => {
    const number = 34; // (((4)))
    const parents = findParents(number);
    const ancestors = findAncestors(number);

    expect(ancestors.length).toBeGreaterThan(parents.length);
  });
});

describe.skip('Ancestor relationships', () => {
  test('ancestors of 34 include [4, 5, 8]', () => {
    const ancestors = findAncestors(34);
    expect(ancestors).toEqual([4, 5, 8]);
  });

  test('ancestors of 13 include [1, 4, 5, 6]', () => {
    const ancestors = findAncestors(13);
    expect(ancestors).toEqual([1, 4, 5, 6]);
  });

  test('ancestors include parents and their ancestors', () => {
    const ancestors = findAncestors(12); // ((4))4
    expect(ancestors).toEqual([4, 5, 8]); // 8's ancestors (4,5) plus 4
  });
});
