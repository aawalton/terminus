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

// Convert from decimal to canonical representation
function toCanonical(n) {
  // Handle base cases 1-4
  if (n <= 4) return n.toString();

  // Find the largest Fibonacci number <= n
  let maxFibIndex = 1;
  while (getFibonacci(maxFibIndex + 1) <= n) {
    maxFibIndex++;
  }

  const fibValue = getFibonacci(maxFibIndex);
  const diff = n - fibValue;

  // If this is exactly a Fibonacci number with index > 4
  if (diff === 0 && maxFibIndex > 4) {
    // Find the representation of the previous Fibonacci number
    const prevFibIndex = maxFibIndex - 1;
    return `(${toCanonical(prevFibIndex)})`;
  }

  // For numbers like 13 = ((4)1), we need to check if it can be represented
  // as a nested expression plus a small number
  for (let i = 4; i >= 1; i--) {
    const base = `((${i}))`;  // Try double nesting
    const baseValue = toDecimal(base);

    // If adding a small number (1-4) to the base gives us our target
    if (baseValue < n && n <= baseValue + 4) {
      const remainder = n - baseValue;
      if (remainder > 0) {
        return `((${i})${remainder})`;
      }
      return base;
    }
  }

  // For numbers that are sum of a Fibonacci number and a small number (1-4)
  if (diff >= 1 && diff <= 4) {
    // Find representation of the Fibonacci part
    const fibRepr = toCanonical(fibValue);
    return `${fibRepr}${diff}`;
  }

  return null;
}

export {
  getFibonacci,
  toDecimal,
  toCanonical
};

