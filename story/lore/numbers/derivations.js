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

import { toCanonical } from "./numbers";

function isDerivedFrom(a, b) {
  // First check decimal value comparison (reversed)
  if (b >= a) return false;

  // Get canonical representations
  const reprA = toCanonical(a);
  const reprB = toCanonical(b);
  console.log({ a, b, reprA, reprB });

  return reprA.includes(reprB);  // Note: Search direction reversed
}

export {
  isDerivedFrom
};
