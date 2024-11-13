/*
Canonical Number Derivation Rules

1. Basic Definition:
   - Number A is derived from number B if:
     a) A > B (decimal value comparison)
     b) The canonical representation of A appears as a strict continuous substring
        within the canonical representation of B

2. Substring Rules:
   - Substrings can be overlapping
   - Substrings must be complete canonical representations

3. Examples of Valid Derivations:
   - 6 is derived from 13
     Because: (4)1 appears in ((4)1)
   - 5 is derived from 8
     Because: (4) appears in ((4))
   - 8 is derived from 34
     Because: ((4)) appears in (((4)))

4. Examples of Invalid Derivations:
   - 3 is not derived from 13
     Because: While "3" appears in "13", it's not a complete canonical representation
   - 6 is not derived from 16
     Because: While both are represented using (4), the "1" in (4)1 is not part of 16's representation
   - 7 is not derived from 13
     Because: (4)2 does not appear in ((4)1)

5. Multiple Derivation Paths:
   - A number can be derived from multiple larger numbers
   - Example: 5 (represented as (4)) can be derived from:
     * 8  (represented as ((4)))
     * 13 (represented as ((4)1))
     * 21 (represented as ((4)2))
     * 34 (represented as (((4))))
*/

import fs from 'fs';
import path from 'path';
import { toCanonical } from './numbers.js';

function isDerivedFrom(a, b) {
  // First check decimal value comparison
  if (a <= b) return false;

  // Get canonical representations
  const reprA = toCanonical(a);
  const reprB = toCanonical(b);

  return reprA.includes(reprB);  // Note: Search direction reversed
}

function generateNumbersData() {
  const numbers = [];

  // Generate data for first 100 numbers
  for (let n = 1; n <= 100; n++) {
    const canonical = toCanonical(n);
    const directDerivedFrom = [];
    const allAncestors = new Set();

    // Check all smaller numbers for derivation
    for (let i = 1; i < n; i++) {
      if (isDerivedFrom(n, i)) {
        // Check if this is a direct derivation
        let isDirectDerivation = true;

        // Look through all numbers between i and n
        for (let j = i + 1; j < n; j++) {
          if (isDerivedFrom(n, j) && isDerivedFrom(j, i)) {
            isDirectDerivation = false;
            break;
          }
        }

        if (isDirectDerivation) {
          directDerivedFrom.push(i);
        }
        allAncestors.add(i);
      }
    }

    numbers.push({
      number: n,
      canonical,
      directDerivedFrom: directDerivedFrom.reverse(),
      allAncestors: Array.from(allAncestors).reverse()
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
  generateNumbersData
};

if (import.meta.url === `file://${process.argv[1]}`) {
  generateNumbersData();
}
