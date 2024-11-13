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
      sum += getFibonacci(innerValue);
      i = j;
    } else if (/\d/.test(repr[i])) {
      sum += Number(repr[i]);
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

  // Try nested expressions first (for numbers like 8 = ((4)))
  for (let i = 1; i < n; i++) {
    const inner = toCanonical(i);
    if (inner) {
      const withParens = `(${inner})`;
      if (toDecimal(withParens) === n) {
        return withParens;
      }
      // Try adding simple numbers to nested expressions
      for (let j = 1; j <= 4; j++) {
        if (toDecimal(withParens + j) === n) {
          return withParens + j;
        }
      }
    }
  }

  // Try simple Fibonacci numbers
  for (let i = 1; i <= n; i++) {
    const value = getFibonacci(i);
    if (value === n) {
      return `(${i})`;
    }
    // Try adding simple numbers to Fibonacci numbers
    if (value < n) {
      const diff = n - value;
      if (diff >= 1 && diff <= 4) {
        return `(${i})${diff}`;
      }
    }
  }

  return null;
}

export {
  getFibonacci,
  toDecimal,
  toCanonical
};
