import {
  getBaseHuntingCost,
  calculateHuntingCostIncrease,
  calculateHuntingCostReduction,
  calculateFinalHuntingCost,
  generateCreature,
  calculateHuntingRewards
} from './hunting';
import { Zone } from './worlds';

describe('Hunting System', () => {
  const mockZone: Zone = {
    name: "Test Zone",
    id: "test-0-0",
    size: 100,
    density: 5,
    difficulty: 2
  };

  describe('hunting costs', () => {
    test('calculates base hunting cost correctly', () => {
      const cost = getBaseHuntingCost(mockZone);
      expect(cost).toBe(BigInt(10)); // density * difficulty = 5 * 2
    });

    test('calculates cost increase correctly', () => {
      const increase = calculateHuntingCostIncrease(mockZone);
      expect(increase).toBe(BigInt(5)); // density = 5
    });

    test('calculates cost reduction correctly', () => {
      const reduction = calculateHuntingCostReduction(mockZone);
      expect(reduction).toBe(BigInt(5)); // density = 5
    });

    test('calculates final cost with root coverage', () => {
      const storedCost = BigInt(10);

      // 50% coverage = multiplier of 2
      expect(calculateFinalHuntingCost(storedCost, 0.5)).toBe(BigInt(20));

      // 25% coverage = multiplier of 4
      expect(calculateFinalHuntingCost(storedCost, 0.25)).toBe(BigInt(40));

      // 75% coverage = multiplier of ~1.33 (134/100)
      expect(calculateFinalHuntingCost(storedCost, 0.75)).toBe(BigInt(13));
    });
  });

  describe('generateCreature', () => {
    test('generates creatures within expected level range', () => {
      const creatures = Array.from({ length: 1000 }, () => generateCreature(mockZone));

      const levels = creatures.map(c => c.level);
      const minLevel = Math.min(...levels);
      const maxLevel = Math.max(...levels);

      expect(minLevel).toBe(4); // density - 1
      expect(maxLevel).toBe(6); // density + 1

      // Check level distribution
      const levelCounts = levels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // 90% should be density - 1
      expect(levelCounts[4] / 1000).toBeCloseTo(0.9, 1);
    });

    test('generates essence within expected range', () => {
      const creature = generateCreature(mockZone);
      expect(creature.essence).toBeGreaterThan(BigInt(0));
      expect(creature.name).toBe("Horned Rabbit");
    });
  });

  describe('calculateHuntingRewards', () => {
    test('calculates essence reward correctly', () => {
      const creature = {
        name: "Horned Rabbit",
        level: 5,
        essence: BigInt(1000)
      };

      const { essence } = calculateHuntingRewards(creature, 5);
      expect(essence).toBe(BigInt(10)); // 1% of 1000
    });

    test('adjusts credits based on level difference', () => {
      const creature = {
        name: "Horned Rabbit",
        level: 5,
        essence: BigInt(1000)
      };

      // Same level
      expect(calculateHuntingRewards(creature, 5).credits).toBe(6);

      // Player higher level
      expect(calculateHuntingRewards(creature, 7).credits).toBe(2);

      // Player lower level
      expect(calculateHuntingRewards(creature, 3).credits).toBe(12);
    });
  });
}); 