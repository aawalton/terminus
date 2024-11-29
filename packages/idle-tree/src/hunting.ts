import { Zone } from './worlds';

export interface Creature {
  name: string;
  level: number;
  essence: bigint;
}

/**
 * Calculate the maximum prey a zone can hold based on its size and root coverage
 */
export function calculateMaxZonePrey(zone: Zone, rootSaturation: string): number {
  const coverage = BigInt(rootSaturation || '0') / (BigInt(zone.size) * BigInt(zone.density) * BigInt(zone.difficulty));
  return Math.floor(Number(coverage) * zone.size);
}

/**
 * Calculate the probability of generating new prey in a zone per minute
 */
export function calculatePreyGenerationProbability(zone: Zone, rootSaturation: string): number {
  const saturation = BigInt(rootSaturation || '0');
  return Number(saturation * BigInt(zone.size)) / (zone.difficulty * 60);
}

/**
 * Calculate how many new prey should be added based on time passed
 * Returns the number of new prey to add
 */
export function calculateNewPrey(
  zone: Zone,
  rootSaturation: string,
  currentPrey: string,
  minutesPassed: number
): number {
  const maxPrey = calculateMaxZonePrey(zone, rootSaturation);
  const current = Number(currentPrey || '0');

  if (current >= maxPrey) {
    return 0;
  }

  const probability = calculatePreyGenerationProbability(zone, rootSaturation);
  let newPrey = 0;

  // For each minute, check if prey should be generated
  for (let i = 0; i < minutesPassed; i++) {
    if (Math.random() < probability) {
      newPrey++;
    }
    // Stop if we've hit the max
    if (current + newPrey >= maxPrey) {
      return maxPrey - current;
    }
  }

  return newPrey;
}

/**
 * Generate a creature when hunting
 * This remains mostly unchanged from the previous version
 */
export function generateCreature(zone: Zone): Creature {
  const roll = Math.random() * 100;

  // Determine creature level based on probability
  let level: number;
  if (roll < 90) {
    level = Math.max(1, zone.density - 1);
  } else if (roll < 99) {
    level = zone.density;
  } else {
    level = zone.density + 1;
  }

  // Calculate essence based on level (using U^3 distribution)
  const baseEssence = BigInt(100); // Base essence for level 1
  const u = Math.random();
  const randomMultiplier = Math.floor(u * u * u * 100) + 1;
  const essence = baseEssence * BigInt(level) * BigInt(randomMultiplier);

  return {
    name: "Horned Rabbit",
    level,
    essence
  };
}

/**
 * Calculate rewards from hunting
 * This remains unchanged from the previous version for now
 */
export function calculateHuntingRewards(creature: Creature, playerLevel: number): {
  essence: bigint;
  credits: number;
} {
  const essenceReward = creature.essence / BigInt(100);

  let credits = 1 + creature.level;

  const levelDifference = playerLevel - creature.level;
  if (levelDifference > 0) {
    credits = Math.floor(credits / (levelDifference + 1));
  } else if (levelDifference < 0) {
    credits = credits * Math.abs(levelDifference);
  }

  return {
    essence: essenceReward,
    credits: Math.max(1, credits)
  };
} 