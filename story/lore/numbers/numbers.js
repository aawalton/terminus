/*
Canonical Number Representation Rules

1. Basic Symbols:
   - Single digits: 1, 2, 3, 4
   - Parentheses: ( )
   - Adjacent numbers are added together
   - Numbers inside parentheses represent Fibonacci sequence values

2. Conversion Rules:
   - (n) = The nth Fibonacci number (1-based index)
     Example: (4) = 5, ((4)) = 8
   - Adjacent digits and expressions are summed
     Example: (4)1 = 6, (4)2 = 7
   - Nested parentheses evaluate inner expressions first
     Example: ((4)) = (5) = 8

3. Special Cases:
   - Numbers 1-4 are represented directly
   - 5 is represented as (4)
   - Numbers > 4 use combinations of parentheses and digits 1-4
   - Some numbers have multiple valid representations; canonical form prefers:
     a) Pure Fibonacci representations when exact
     b) Otherwise, the representation that starts with the largest possible prefix

4. Examples:
   5 = (4)
   6 = (4)1
   7 = (4)2
   8 = ((4))
   13 = ((4)1)
   21 = ((4)2)
   34 = (((4)))

5. Multiple Representation Examples:
   18 can be written as:
   - ((4)1)(4)   <- Canonical (starts with larger component ((4)1) = 13)
   - ((4))((4))  <- Valid but not canonical (starts with ((4)) = 8)

   29 can be written as:
   - ((4)2)((4))   <- Canonical (starts with ((4)2) = 21)
   - ((4))((4))((4))1  <- Valid but not canonical (starts with ((4)) = 8)

   34 can be written as:
   - (((4)))       <- Canonical (pure Fibonacci number)
   - ((4)2)((4))4  <- Valid but not canonical (composite representation)
*/


// Get nth Fibonacci number (1-based index)
function getFibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;

  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// Convert from canonical representation to decimal
function toDecimal(repr) {
  // Base cases
  if (!repr) return 0;
  if (/^\d$/.test(repr)) return Number(repr);

  let sum = 0;
  let i = 0;
  let currentGroup = '';

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

      // Get the substring between parentheses
      const inner = repr.slice(i + 1, j - 1);

      // Evaluate the inner expression first
      const innerValue = toDecimal(inner);

      // Apply Fibonacci function to the inner value
      const fibValue = getFibonacci(innerValue);

      // Add to sum and move pointer
      sum += fibValue;
      i = j;

      // Reset current group after processing nested expression
      currentGroup = '';
    } else if (/\d/.test(repr[i])) {
      currentGroup += repr[i];
      if (i === repr.length - 1 || !(/\d/.test(repr[i + 1]))) {
        sum += Number(currentGroup);
        currentGroup = '';
      }
      i++;
    } else {
      i++;
    }
  }

  return sum;
}

// Helper function to find Fibonacci index (1-based)
function getFibonacciIndex(n) {
  // Special cases
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;

  // Build sequence until we find n
  let a = 1, b = 2;
  let index = 2;

  while (b <= n) {
    if (b === n) {
      return index;
    }
    [a, b] = [b, a + b];
    index++;
  }

  return index - 1;
}

// Convert from decimal to canonical representation
function toCanonical(n) {
  // Base cases
  if (n <= 4) return n.toString();

  // Find the largest Fibonacci number less than or equal to n
  const fibIndex = getFibonacciIndex(n);
  const fib = getFibonacci(fibIndex);

  // If it's an exact Fibonacci number
  if (fib === n) {
    if (fibIndex === 4) return '(4)';

    // Get the canonical form of the index
    const indexCanonical = toCanonical(fibIndex);

    // Wrap the index representation in parentheses
    return `(${indexCanonical})`;
  }

  // For non-Fibonacci numbers, use the largest possible prefix
  const remainder = n - fib;

  // If remainder is small enough, append directly
  if (remainder <= 4) {
    return `${toCanonical(fib)}${remainder}`;
  }

  // Try the next largest Fibonacci number as prefix
  const nextFibIndex = fibIndex - 1;
  const nextFib = getFibonacci(nextFibIndex);
  const nextRemainder = n - nextFib;

  if (nextFib > 4 && nextRemainder > 0) {
    // Check if this decomposition is better
    const nextFibRepr = toCanonical(nextFib);
    const nextRemRepr = toCanonical(nextRemainder);
    const nextTotal = toDecimal(nextFibRepr + nextRemRepr);

    if (nextTotal === n) {
      return nextFibRepr + nextRemRepr;
    }
  }

  // Default to using the largest prefix
  return `${toCanonical(fib)}${toCanonical(remainder)}`;
}

export {
  getFibonacci,
  getFibonacciIndex,
  toDecimal,
  toCanonical
};

