import {
  calculateMaxZonePrey,
  calculatePreyGenerationProbability,
  calculateNewPrey,
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

  describe('prey calculations', () => {
    test('calculates max prey based on root coverage', () => {
      // Full coverage (100 * 5 * 2 = 1000)
      const fullSaturation = '1000';
      expect(calculateMaxZonePrey(mockZone, fullSaturation)).toBe(100);

      // 30% coverage (300/1000)
      expect(calculateMaxZonePrey(mockZone, '300')).toBe(30);

      // 59% coverage (590/1000) - starter zone default
      expect(calculateMaxZonePrey(mockZone, '590')).toBe(59);

      // No coverage
      expect(calculateMaxZonePrey(mockZone, '0')).toBe(0);
    });

    test('calculates prey generation probability', () => {
      // Full coverage (probability = (100 * 1) / 60 = 1.6666666666666667)
      const probability = calculatePreyGenerationProbability(mockZone, '1000');
      expect(probability).toBeCloseTo(1.6666666666666667);

      // 30% coverage (probability = (100 * 0.3) / 60 = 0.5)
      const partialProbability = calculatePreyGenerationProbability(mockZone, '300');
      expect(partialProbability).toBeCloseTo(0.5);

      // No coverage
      expect(calculatePreyGenerationProbability(mockZone, '0')).toBe(0);
    });

    test('calculates new prey over time', () => {
      // Mock random to return values that will generate exactly one prey
      let callCount = 0;
      const originalMathRandom = Math.random;
      Math.random = () => {
        callCount++;
        // Return 0.001 for the first check (to generate one prey)
        // and 1 for all subsequent checks (to prevent more prey)
        return callCount === 1 ? 0.001 : 1;
      };

      // Full saturation, probability ~1.6667, 1 minute = expect ~1 prey over 1 minute
      const fullPrey = calculateNewPrey(mockZone, '1000', '0', 1);
      expect(fullPrey).toBe(1);

      // Reset call count
      callCount = 0;

      // 30% saturation, probability 0.5, 1 minute = expect ~0 or 1 prey
      const partialPrey = calculateNewPrey(mockZone, '300', '0', 1);
      expect(partialPrey).toBe(1);

      // Test max prey limit
      expect(calculateNewPrey(mockZone, '1000', '100', 1000)).toBe(0);

      // Reset call count
      callCount = 0;

      // Test near max prey
      const nearMaxPrey = calculateNewPrey(mockZone, '1000', '99', 1000);
      // With probability ~1.6667, expect at least 1 prey to reach max
      expect(nearMaxPrey).toBeGreaterThanOrEqual(1);

      // Restore original Math.random
      Math.random = originalMathRandom;
    });

    test('respects maximum prey limit', () => {
      // Mock random to always return 0 for guaranteed prey generation
      const originalMathRandom = Math.random;
      Math.random = () => 0;

      // Full saturation but already at max prey
      expect(calculateNewPrey(mockZone, '1000', '100', 1000)).toBe(0);

      // Full saturation with 90 prey, should only add up to max (10)
      expect(calculateNewPrey(mockZone, '1000', '90', 1000)).toBe(10);

      // Restore original Math.random
      Math.random = originalMathRandom;
    });
  });

  describe('creature generation', () => {
    test('generates creatures within expected level range', () => {
      // Mock random to ensure we hit all possible values
      let callCount = 0;
      const originalMathRandom = Math.random;
      Math.random = () => {
        if (callCount === 0) {
          // 1st call: generate creature level
          callCount++;
          return 0.995; // 0.995 > 0.99 => highest level
        } else if (callCount === 1) {
          // 2nd call: generate essence multiplier
          callCount++;
          return 0.95; // some multiplier
        } else {
          callCount = 0;
          return 0.5; // default random
        }
      };

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

      expect(levelCounts[4]).toBeGreaterThan(0);
      expect(levelCounts[5]).toBeGreaterThan(0);
      expect(levelCounts[6]).toBeGreaterThan(0);

      // Restore original Math.random
      Math.random = originalMathRandom;
    });
  });

  describe('hunting rewards', () => {
    test('calculates rewards correctly', () => {
      const creature = {
        name: "Horned Rabbit",
        level: 5,
        essence: BigInt(1000)
      };

      // Same level
      const sameLevel = calculateHuntingRewards(creature, 5);
      expect(sameLevel.essence).toBe(BigInt(10));
      expect(sameLevel.credits).toBe(6);

      // Higher level player
      const highLevel = calculateHuntingRewards(creature, 7);
      expect(highLevel.credits).toBe(2);

      // Lower level player
      const lowLevel = calculateHuntingRewards(creature, 3);
      expect(lowLevel.credits).toBe(12);
    });
  });
}); 