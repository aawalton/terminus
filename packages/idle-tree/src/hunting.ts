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
  // Calculate coverage as a percentage (0-1)
  const totalSaturation = BigInt(zone.size) * BigInt(zone.density) * BigInt(zone.difficulty);
  const coverage = Number(BigInt(rootSaturation || '0')) / Number(totalSaturation);

  // Max prey is proportional to coverage
  return Math.floor(zone.size * coverage);
}

/**
 * Calculate the probability of generating new prey in a zone per minute
 */
export function calculatePreyGenerationProbability(zone: Zone, rootSaturation: string): number {
  // Calculate coverage as a percentage (0-1)
  const totalSaturation = BigInt(zone.size) * BigInt(zone.density) * BigInt(zone.difficulty);
  const coverage = Number(BigInt(rootSaturation || '0')) / Number(totalSaturation);

  // Updated probability: zone size times coverage divided by 60
  return (zone.size * coverage) / 60;
}

/**
 * Calculate how many new prey should be added based on time passed
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
  for (let i = 0; i < minutesPassed && current + newPrey < maxPrey; i++) {
    if (Math.random() < probability) {
      newPrey++;
    }
  }

  return newPrey;
}

/**
 * Generate a creature when hunting
 */
export function generateCreature(zone: Zone): Creature {
  // Generate a number between 0 and 1
  const roll = Math.random();

  // Determine creature level based on probability
  let level: number;
  if (roll < 0.90) {  // 90% chance
    level = zone.density - 1;
  } else if (roll < 0.99) {  // 9% chance
    level = zone.density;
  } else {  // 1% chance
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