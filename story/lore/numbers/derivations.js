import { writeFile } from 'fs/promises';

// Convert a number to its canonical representation
function toCanonical(n) {
  if (n <= 4) return n.toString();

  // Build up numbers by following the pattern in numerology.md
  let current = 4;
  let representation = '(4)';
  let stack = [representation];

  while (current < n) {
    let next = representation;

    // Try adding simple numbers (1-4)
    for (let i = 1; i <= 4; i++) {
      if (current + i === n) return representation + i;
    }

    // Try wrapping in parentheses
    next = `(${representation})`;
    let nextValue = evaluateRepresentation(next);
    if (nextValue === n) return next;
    if (nextValue < n) {
      representation = next;
      current = nextValue;
      stack.push(representation);
      continue;
    }

    // Try adding numbers and previous representations
    for (let base of stack) {
      next = representation + base;
      nextValue = evaluateRepresentation(next);
      if (nextValue === n) return next;
      if (nextValue < n) {
        representation = next;
        current = nextValue;
        break;
      }
    }
  }

  return representation;
}

// Evaluate a canonical representation to get its decimal value
function evaluateRepresentation(repr) {
  // Base cases
  if (!repr) return 0;
  if (/^\d$/.test(repr)) return parseInt(repr);

  let sum = 0;
  let i = 0;

  while (i < repr.length) {
    if (repr[i] === '(') {
      // Find matching parenthesis
      let depth = 1;
      let j = i + 1;
      while (depth > 0 && j < repr.length) {
        if (repr[j] === '(') depth++;
        if (repr[j] === ')') depth--;
        j++;
      }
      // Recursively evaluate the contents
      let inner = evaluateRepresentation(repr.slice(i + 1, j - 1));
      // Apply the parentheses function (get corresponding Fibonacci number)
      sum += getFibonacci(inner);
      i = j;
    } else if (/\d/.test(repr[i])) {
      sum += parseInt(repr[i]);
      i++;
    } else {
      i++;
    }
  }

  return sum;
}

// Get nth Fibonacci number (0-based index)
function getFibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// Find all numbers that derive from a given representation
function findDerivations(repr) {
  const derivations = new Set();

  // Helper function to process a substring
  function processSubstring(sub) {
    if (!sub) return;
    // Validate balanced parentheses
    let depth = 0;
    for (let char of sub) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) return;
    }
    if (depth !== 0) return;

    // Evaluate if it's a valid number representation
    try {
      const value = evaluateRepresentation(sub);
      if (value > 0) {
        derivations.add(value);
      }
    } catch (e) {
      // Invalid representation, skip
    }
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
    const canonical = toCanonical(i);
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
  toCanonical,
  evaluateRepresentation,
  getFibonacci,
  findDerivations,
  generateDerivations,
  generateNumbersJson
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateNumbersJson().catch(console.error);
}
