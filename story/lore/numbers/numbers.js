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

