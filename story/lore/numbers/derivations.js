/*
Canonical Number Derivation Rules

1. Parent Rules:
   - Numbers 1-4 have no parents
   - Number 5 has exactly one parent: 4
   - All other numbers have exactly two parents, determined by their canonical form:
     a) For numbers of form (A)B: parents are A and B
     b) For numbers of form (A): parents are A and 5 (where 5 represents parentheses)

2. Examples of Parent Relationships:
   - 12 = ((4))4 has parents [8, 4] because it's (8)4
   - 13 = ((4)1) has parents [6, 5] because it's (6)
   - 34 = (((4))) has parents [8, 5] because it's (8)

3. Ancestor Rules:
   - A number's ancestors include its parents and their ancestors
   - Ancestors are determined by substring relationships in canonical form
   - A number B is an ancestor of A if B's canonical form appears as a complete
     substring within A's canonical form

4. Examples of Ancestor Relationships:
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

function isDerivedFrom(a, b) {
  // First check decimal value comparison
  if (a <= b) return false;

  // Get canonical representations
  const reprA = toCanonical(a);
  const reprB = toCanonical(b);

  return reprA.includes(reprB);  // Note: Search direction reversed
}

function findParents(n) {
  if (n <= 4) return [];
  if (n === 5) return [4];

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

  // Parse the canonical form to find parents
  if (canonical[0] === '(') {
    const closingIndex = findClosingParen(canonical, 0);

    if (closingIndex === canonical.length - 1) {
      // Form (A): parents are A and 5
      const inner = canonical.slice(1, closingIndex);
      return [toDecimal(inner), 5];
    } else {
      // Form (A)B: parents are A and B
      const prefix = canonical.slice(0, closingIndex + 1);
      const suffix = canonical.slice(closingIndex + 1);
      return [toDecimal(prefix), toDecimal(suffix)];
    }
  }

  return [];
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
  for (let n = 1; n <= 100; n++) {
    const canonical = toCanonical(n);
    const parents = [];
    const allAncestors = new Set();

    // Check all smaller numbers for derivation
    for (let i = 1; i < n; i++) {
      if (isDerivedFrom(n, i)) {
        // Check if this is a direct derivation
        let isParent = true;

        // Look through all numbers between i and n
        for (let j = i + 1; j < n; j++) {
          if (isDerivedFrom(n, j) && isDerivedFrom(j, i)) {
            isParent = false;
            break;
          }
        }

        if (isParent) {
          parents.push(i);
        }
        allAncestors.add(i);
      }
    }

    numbers.push({
      number: n,
      canonical,
      parents: parents.reverse(),
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
  findAncestors,
  generateNumbersData
};

if (import.meta.url === `file://${process.argv[1]}`) {
  generateNumbersData();
}
