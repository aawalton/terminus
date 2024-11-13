// Get nth Fibonacci number (0-based index)
function getFibonacci(n) {
  if (n <= 1) return n;

  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
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
      // Get the inner expression value and convert to Fibonacci number
      const innerValue = toDecimal(repr.slice(i + 1, j - 1));
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
  // Handle base cases 0-4
  if (n <= 4) return n.toString();

  // Find largest Fibonacci number less than or equal to n
  let fibNumbers = [];
  let fibIndices = [];
  let i = 0;
  let fib = getFibonacci(i);

  while (fib <= n) {
    fibNumbers.push(fib);
    fibIndices.push(i);
    i++;
    fib = getFibonacci(i);
  }

  // Get the largest Fibonacci number <= n
  const largestFib = fibNumbers[fibNumbers.length - 1];
  const index = fibIndices[fibIndices.length - 1];
  const remainder = n - largestFib;

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
