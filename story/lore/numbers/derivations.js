import { writeFile } from 'fs/promises';
import { getFibonacci, toDecimal, toCanonical } from './numbers.js';

// Find all numbers that derive from a given representation
function findDerivations(repr) {
  const derivations = new Set();

  // Helper function to process a substring
  function processSubstring(sub) {
    if (!sub) return;

    // Only process if it's a valid part of the original representation
    if (!isValidSubstring(sub)) return;

    // Evaluate if it's a valid number representation
    try {
      const value = toDecimal(sub);
      if (value > 0) {
        // Also add the value of any nested expressions
        if (sub.includes('(')) {
          let depth = 0;
          let start = -1;

          for (let i = 0; i < sub.length; i++) {
            if (sub[i] === '(') {
              if (depth === 0) start = i;
              depth++;
            } else if (sub[i] === ')') {
              depth--;
              if (depth === 0 && start !== -1) {
                const nested = sub.slice(start + 1, i);
                const nestedValue = toDecimal(nested);
                if (nestedValue > 0) {
                  derivations.add(nestedValue);
                }
              }
            }
          }
        }
        derivations.add(value);
      }
    } catch (e) {
      // Invalid representation, skip
    }
  }

  // Helper to check if a substring is valid
  function isValidSubstring(sub) {
    // Check if it's a simple number or valid parenthetical expression
    if (/^\d+$/.test(sub)) {
      return sub.length === 1; // Only single digits are valid
    }

    // Validate balanced parentheses and structure
    let depth = 0;
    for (let char of sub) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) return false;
    }
    return depth === 0;
  }

  // Check all possible substrings
  for (let i = 0; i < repr.length; i++) {
    for (let j = i + 1; j <= repr.length; j++) {
      processSubstring(repr.slice(i, j));
    }
  }

  return Array.from(derivations).sort((a, b) => a - b);
}

// Generate derivations for numbers 1 to n
function generateDerivations(n) {
  const results = {};

  for (let i = 1; i <= n; i++) {
    // Get the canonical representation from numbers.js
    const canonical = toCanonical(i);

    // Find all numbers that this representation derives from
    const derivedFrom = findDerivations(canonical)
      .filter(x => x < i); // Only include numbers less than current

    results[i] = {
      representation: canonical,
      derivedFrom: derivedFrom
    };
  }

  return results;
}

async function generateNumbersJson(n = 10) {
  try {
    console.log('Generating numbers.json...');
    const results = generateDerivations(n);
    await writeFile('story/lore/numbers/numbers.json', JSON.stringify(results, null, 2));
    console.log('Successfully generated numbers.json!');
  } catch (error) {
    console.error('An error occurred while generating numbers.json:', error);
    throw error;
  }
}

// Export functions for importing
export {
  findDerivations,
  generateDerivations,
  generateNumbersJson
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateNumbersJson().catch(console.error);
}
