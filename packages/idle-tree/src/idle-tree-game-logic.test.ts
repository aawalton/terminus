import {
  getCultivationStage,
  calculateAgeInDays,
  calculateMaxEssence,
  CULTIVATION_STAGES,
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
        { level: 10, name: 'Soul Fire 1', essence: '14400' },
      ];

      expectedStages.forEach(({ level, name, essence }) => {
        expect(getCultivationStage(level)).toBe(name);
        expect(calculateMaxEssence(level).toString()).toBe(essence);
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
          { level: 10, expected: 'Soul Fire 1' },
          { level: 19, expected: 'Star Core 1' },
          { level: 28, expected: 'Nascent Soul 1' },
          { level: 37, expected: 'Monarch 1' },
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
    });

    describe('Edge cases', () => {
      test('handles levels beyond defined stages', () => {
        const lastDefinedStage = CULTIVATION_STAGES[CULTIVATION_STAGES.length - 1].name;
        expect(getCultivationStage(999)).toBe(lastDefinedStage);
      });
    });
  });

  describe('Essence calculations', () => {
    describe('Regular stages', () => {
      test('returns correct essence for normal levels', () => {
        expect(calculateMaxEssence(5).toString()).toBe('1300'); // EG 5
      });
    });

    describe('Breakthrough levels', () => {
      test('sums previous 5 levels for tier transitions', () => {
        // Test breakthrough from EG to Soul Fire
        const breakthrough = calculateMaxEssence(10);
        const sum = Array.from({ length: 5 })
          .reduce((acc, _, i) => acc + CULTIVATION_STAGES[10 - i].essence, BigInt(0));

        expect(breakthrough.toString()).toBe(sum.toString());
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