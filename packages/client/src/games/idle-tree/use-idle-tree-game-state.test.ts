import {
  getCultivationStage,
  calculateAgeInDays,
  getFibonacciEssence,
  calculateMaxEssence,
} from './use-idle-tree-game-state';

describe('getCultivationStage', () => {
  test('returns correct stage for Mortal tier', () => {
    expect(getCultivationStage(0)).toBe('Mortal');
  });

  test('returns correct stages for Essence Gathering tier', () => {
    expect(getCultivationStage(1)).toBe('Essence Gathering 1');
    expect(getCultivationStage(9)).toBe('Essence Gathering 9');
  });

  test('returns correct stages for Soul Fire tier', () => {
    expect(getCultivationStage(14)).toBe('Soul Fire 1');
    expect(getCultivationStage(22)).toBe('Soul Fire 9');
  });

  test('returns correct stages for Star Core tier', () => {
    expect(getCultivationStage(23)).toBe('Star Core 1');
    expect(getCultivationStage(31)).toBe('Star Core 9');
  });

  test('returns correct stages for Nascent Soul tier', () => {
    expect(getCultivationStage(32)).toBe('Nascent Soul 1');
    expect(getCultivationStage(40)).toBe('Nascent Soul 9');
  });

  test('returns correct stages for Monarch tier', () => {
    expect(getCultivationStage(41)).toBe('Monarch 1');
    expect(getCultivationStage(49)).toBe('Monarch 9');
  });

  test('handles levels between tiers correctly', () => {
    expect(getCultivationStage(13)).toBe('Essence Gathering 9');
    expect(getCultivationStage(50)).toBe('Monarch 9');
  });
});

describe('calculateAgeInDays', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('calculates age correctly', () => {
    const now = new Date('2024-03-15T12:00:00Z');
    jest.setSystemTime(now);

    const createdAt = new Date('2024-03-14T12:00:00Z');
    expect(calculateAgeInDays(createdAt.toISOString())).toBe(24);
  });

  test('returns 0 for new trees', () => {
    const now = new Date('2024-03-15T12:00:00Z');
    jest.setSystemTime(now);

    expect(calculateAgeInDays(now.toISOString())).toBe(0);
  });
});

describe('getFibonacciEssence', () => {
  test('returns correct values for initial levels', () => {
    expect(getFibonacciEssence(0).toString()).toBe('100');
    expect(getFibonacciEssence(1).toString()).toBe('200');
    expect(getFibonacciEssence(2).toString()).toBe('300');
  });

  test('follows Fibonacci sequence for higher levels', () => {
    expect(getFibonacciEssence(3).toString()).toBe('500');
    expect(getFibonacciEssence(4).toString()).toBe('800');
    expect(getFibonacciEssence(5).toString()).toBe('1300');
  });

  test('handles large numbers correctly', () => {
    // Test a higher level to ensure BigInt handles large numbers
    const level10Result = getFibonacciEssence(10);
    expect(typeof level10Result).toBe('bigint');
    expect(level10Result.toString().length).toBeGreaterThan(3);
  });
});

describe('calculateMaxEssence', () => {
  test('returns correct essence for base levels', () => {
    expect(calculateMaxEssence(0).toString()).toBe('100'); // Mortal
    expect(calculateMaxEssence(1).toString()).toBe('200'); // First EG
  });

  test('returns correct essence within tiers', () => {
    // Test within Essence Gathering tier
    expect(calculateMaxEssence(5).toString()).toBe(getFibonacciEssence(5).toString());

    // Test within Soul Fire tier
    expect(calculateMaxEssence(15).toString()).toBe(getFibonacciEssence(15).toString());
  });

  test('handles transition levels between tiers', () => {
    // Test level between Essence Gathering and Soul Fire (e.g., level 12)
    const level12Essence = calculateMaxEssence(12);
    expect(typeof level12Essence).toBe('bigint');

    // Test level between Soul Fire and Star Core
    const level22Essence = calculateMaxEssence(22);
    expect(typeof level22Essence).toBe('bigint');
  });

  test('returns sum of last 5 Fibonacci numbers for between-tier levels', () => {
    // Test a level between tiers (e.g., level 10)
    const level10 = calculateMaxEssence(10);
    let sum = BigInt(0);
    for (let i = 0; i < 5; i++) {
      sum += getFibonacciEssence(10 - i);
    }
    expect(level10.toString()).toBe(sum.toString());
  });
}); 