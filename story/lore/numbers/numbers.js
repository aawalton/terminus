// Get nth Fibonacci number (1-based index)
function getFibonacci(n) {
  if (n <= 0) return 0;
  if (n <= 2) return n;

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

      // If inner contains parentheses, evaluate it first
      if (inner.includes('(')) {
        sum += toDecimal(inner);
      } else {
        // Otherwise use it as an index for Fibonacci
        sum += getFibonacci(toDecimal(inner));
      }
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
  // Handle base cases 0-4
  if (n <= 3) return n.toString();

  // Find the index of the largest Fibonacci number <= n
  let index = 1;
  while (getFibonacci(index + 1) <= n) {
    index++;
  }

  const fib = getFibonacci(index);
  const remainder = n - fib;

  // If no remainder, return the representation
  if (remainder === 0) {
    return `(${index})`;
  }

  // Otherwise combine with remainder
  return `(${index})${toCanonical(remainder)}`;
}

export {
  getFibonacci,
  toDecimal,
  toCanonical
};
