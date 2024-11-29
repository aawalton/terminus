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
      // Full coverage
      const fullSaturation = (BigInt(100) * BigInt(5) * BigInt(2)).toString();
      expect(calculateMaxZonePrey(mockZone, fullSaturation)).toBe(100);

      // Half coverage
      const halfSaturation = (BigInt(100) * BigInt(5) * BigInt(2) / BigInt(2)).toString();
      expect(calculateMaxZonePrey(mockZone, halfSaturation)).toBe(50);

      // No coverage
      expect(calculateMaxZonePrey(mockZone, '0')).toBe(0);
    });

    test('calculates prey generation probability', () => {
      // Full saturation
      const fullSaturation = (BigInt(100) * BigInt(5) * BigInt(2)).toString();
      const probability = calculatePreyGenerationProbability(mockZone, fullSaturation);
      expect(probability).toBeLessThanOrEqual(1);
      expect(probability).toBeGreaterThan(0);

      // No saturation
      expect(calculatePreyGenerationProbability(mockZone, '0')).toBe(0);
    });

    test('calculates new prey over time', () => {
      const fullSaturation = (BigInt(100) * BigInt(5) * BigInt(2)).toString();

      // Test with no current prey and full saturation
      const newPrey = calculateNewPrey(mockZone, fullSaturation, '0', 60);
      expect(newPrey).toBeGreaterThanOrEqual(0);
      expect(newPrey).toBeLessThanOrEqual(100); // Can't exceed zone size

      // Test with max prey
      expect(calculateNewPrey(mockZone, fullSaturation, '100', 60)).toBe(0);

      // Test with no saturation
      expect(calculateNewPrey(mockZone, '0', '0', 60)).toBe(0);
    });
  });

  describe('creature generation', () => {
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