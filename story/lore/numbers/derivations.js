/*
Canonical Number Derivation Rules

1. Parent Rules:
   - Numbers 1-4 have no parents
   - Number 5 has exactly one parent: 4
   - All other numbers have one or more sets of parents, where each set contains exactly two parents
   - Parent sets are determined by valid splits of the canonical form:
     a) For numbers of form (A): one parent set [A, 5] (where 5 represents parentheses)
     b) For numbers of form (A)B: multiple possible parent sets from valid splits
        - Any split that produces two valid numbers forms a parent set
        - Example: (((4))2)(4)1 can have parent sets:
          * [94, 1] from (((4))2)(4) and 1
          * [89, 6] from (((4))2) and (4)1

2. Examples of Parent Sets:
   - 12 = ((4))4 has parent set [8, 4]
   - 13 = ((4)1) has parent set [6, 5]
   - 34 = (((4))) has parent set [8, 5]
   - 95 = (((4))2)(4)1 has parent sets [94, 1] and [89, 6]

3. Semantic Implications:
   - Each parent set contributes to the meaning of the number
   - Different parent sets may emphasize different aspects of the meaning
   - The complete meaning of a number considers all valid parent relationships

4. Ancestor Rules:
   - A number's ancestors include its parents and their ancestors
   - Ancestors are determined by substring relationships in canonical form
   - A number B is an ancestor of A if B's canonical form appears as a complete
     substring within A's canonical form

5. Examples of Ancestor Relationships:
   - 34 = (((4))) has ancestors [4, 5, 8]
     * 8 and 5 are parents
     * 4 is inherited from 5's ancestry
   - 13 = ((4)1) has ancestors [1, 4, 5, 6]
     * 6 and 5 are parents
     * 4 is inherited from 5's ancestry
     * 1 is inherited from 6's ancestry
*/

import fs from 'fs';
import path from 'path';
import { toCanonical, toDecimal } from './numbers.js';

function findParentSets(n) {
  if (n <= 4) return [];
  if (n === 5) return [[4]];

  const canonical = toCanonical(n);

  // Helper to find the matching closing parenthesis
  function findClosingParen(str, start) {
    let depth = 1;
    let i = start + 1;
    while (depth > 0 && i < str.length) {
      if (str[i] === '(') depth++;
      if (str[i] === ')') depth--;
      i++;
    }
    return i - 1;
  }

  // Helper to validate if a string represents a valid number
  function isValidNumber(str) {
    try {
      const num = toDecimal(str);
      return num !== undefined && num !== null && num > 0;
    } catch (e) {
      return false;
    }
  }

  // Helper to check if parentheses are balanced
  function hasBalancedParens(str) {
    let depth = 0;
    for (let char of str) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) return false;
    }
    return depth === 0;
  }

  const parentSets = [];

  // Parse the canonical form to find parents
  if (canonical[0] === '(') {
    const closingIndex = findClosingParen(canonical, 0);

    if (closingIndex === canonical.length - 1) {
      // Form (A): parents are A and 5
      const inner = canonical.slice(1, closingIndex);
      parentSets.push([toDecimal(inner), 5]);
    } else {
      // Form (A)B: find all valid splits
      for (let i = canonical.length - 1; i > 0; i--) {
        const prefix = canonical.slice(0, i);
        const suffix = canonical.slice(i);

        // Only consider valid splits where:
        // 1. Both parts are valid numbers > 0
        // 2. Both parts have balanced parentheses
        if (hasBalancedParens(prefix) && hasBalancedParens(suffix) &&
          isValidNumber(prefix) && isValidNumber(suffix)) {
          const prefixNum = toDecimal(prefix);
          const suffixNum = toDecimal(suffix);
          parentSets.push([prefixNum, suffixNum]);
        }
      }
    }
  }

  return parentSets;
}

// Keep old function for backwards compatibility, using first parent set
function findParents(n) {
  const sets = findParentSets(n);
  // Return the first set found, or empty array if none found
  return sets[0] || [];
}

function isDerivedFrom(a, b) {
  // First check decimal value comparison
  if (a <= b) return false;

  // Get canonical representations
  const reprA = toCanonical(a);
  const reprB = toCanonical(b);

  return reprA.includes(reprB);  // Note: Search direction reversed
}

function findAncestors(n) {
  const ancestors = [];

  // Check all smaller numbers for derivation
  for (let i = 1; i < n; i++) {
    if (isDerivedFrom(n, i)) {
      ancestors.push(i);
    }
  }

  return ancestors.sort((a, b) => a - b);
}

function generateNumbersData() {
  const numbers = [];

  // Generate data for first 100 numbers
  for (let n = 1; n <= 1000; n++) {
    numbers.push({
      number: n,
      canonical: toCanonical(n),
      parents: findParents(n)
    });
  }

  // Write to file
  const outputPath = path.join(process.cwd(), 'story/lore/numbers/numbers.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ numbers }, null, 2),
    'utf8'
  );
}

export {
  isDerivedFrom,
  findParents,
  findParentSets,
  findAncestors,
  generateNumbersData
};

if (import.meta.url === `file://${process.argv[1]}`) {
  generateNumbersData();
}
