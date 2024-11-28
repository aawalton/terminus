import {
  getCultivationStage,
  calculateAgeInDays,
  getFibonacciEssence,
  calculateMaxEssence,
} from './idle-tree-game-logic';

describe('Cultivation System', () => {
  describe('Stage progression', () => {
    test('follows defined progression sequence', () => {
      const expectedStages = [
        { level: 0, name: 'Mortal', essence: '100' },
        { level: 1, name: 'Essence Gathering 1', essence: '200' },
        { level: 2, name: 'Essence Gathering 2', essence: '300' },
        { level: 3, name: 'Essence Gathering 3', essence: '500' },
        { level: 4, name: 'Essence Gathering 4', essence: '800' },
        { level: 10, name: 'Breakthrough to Soul Fire', essence: '21200' },
        { level: 14, name: 'Soul Fire 1', essence: '14400' },
      ];

      expectedStages.forEach(({ level, name, essence }) => {
        expect(getCultivationStage(level)).toBe(name);
        expect(getFibonacciEssence(level).toString()).toBe(essence);
      });
    });
  });

  describe('getCultivationStage', () => {
    describe('Basic tier progression', () => {
      test('starts at Mortal', () => {
        expect(getCultivationStage(0)).toBe('Mortal');
      });

      test('progresses through main tiers', () => {
        const expectedProgression = [
          { level: 1, expected: 'Essence Gathering 1' },
          { level: 14, expected: 'Soul Fire 1' },
          { level: 23, expected: 'Star Core 1' },
          { level: 32, expected: 'Nascent Soul 1' },
          { level: 41, expected: 'Monarch 1' },
        ];

        expectedProgression.forEach(({ level, expected }) => {
          expect(getCultivationStage(level)).toBe(expected);
        });
      });
    });

    describe('Stage progression within tiers', () => {
      test('advances through Essence Gathering stages', () => {
        for (let i = 1; i <= 9; i++) {
          expect(getCultivationStage(i)).toBe(`Essence Gathering ${i}`);
        }
      });

      // Similar tests for other tiers can be added as needed
    });

    describe('Edge cases', () => {
      test('handles levels between tiers', () => {
        expect(getCultivationStage(13)).toBe('Essence Gathering 9');
        expect(getCultivationStage(50)).toBe('Monarch 9');
      });
    });
  });

  describe('Essence calculations', () => {
    describe('getFibonacciEssence', () => {
      test('follows defined sequence for initial levels', () => {
        const expectedSequence = [
          { level: 0, essence: '100' }, // Mortal
          { level: 1, essence: '200' }, // EG 1
          { level: 2, essence: '300' }, // EG 2
          { level: 3, essence: '500' }, // EG 3
          { level: 4, essence: '800' }, // EG 4
        ];

        expectedSequence.forEach(({ level, essence }) => {
          expect(getFibonacciEssence(level).toString()).toBe(essence);
        });
      });
    });

    describe('calculateMaxEssence', () => {
      describe('Regular stages', () => {
        test('uses Fibonacci sequence for normal levels', () => {
          expect(calculateMaxEssence(5).toString()).toBe(getFibonacciEssence(5).toString());
        });
      });

      describe('Breakthrough levels', () => {
        test('sums previous 5 levels for tier transitions', () => {
          // Test breakthrough from EG to Soul Fire (level 10)
          const breakthrough = calculateMaxEssence(10);
          const sum = Array.from({ length: 5 })
            .reduce((acc, _, i) => acc + getFibonacciEssence(10 - i), BigInt(0));

          expect(breakthrough.toString()).toBe(sum.toString());
        });
      });
    });
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