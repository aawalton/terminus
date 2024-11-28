import { Zone } from './worlds';

export interface Creature {
  name: string;
  level: number;
  essence: bigint;
}

export function getBaseHuntingCost(zone: Zone): bigint {
  return BigInt(zone.density * zone.difficulty);
}

export function calculateHuntingCostIncrease(zone: Zone): bigint {
  return BigInt(zone.density);
}

export function calculateHuntingCostReduction(zone: Zone): bigint {
  return BigInt(zone.density);
}

export function calculateFinalHuntingCost(
  storedCost: bigint,
  rootCoverage: number
): bigint {
  // If coverage is 0, return maximum cost (100x base cost)
  if (rootCoverage <= 0) {
    return storedCost * BigInt(100);
  }

  // Coverage is 0-1, so 1/coverage gives us the multiplier
  // We multiply by 100 first to maintain precision with BigInt
  const coverageMultiplier = BigInt(Math.ceil(100 / rootCoverage));

  // Calculate final cost with coverage multiplier, then divide by 100
  return (storedCost * coverageMultiplier) / BigInt(100);
}

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

export function calculateHuntingRewards(creature: Creature, playerLevel: number): {
  essence: bigint;
  credits: number;
} {
  // Calculate essence reward (1% of creature essence)
  const essenceReward = creature.essence / BigInt(100);

  // Calculate credits
  let credits = 1 + creature.level; // Base credits + creature level

  const levelDifference = playerLevel - creature.level;
  if (levelDifference > 0) {
    // Divide credits if player is higher level
    credits = Math.floor(credits / (levelDifference + 1));
  } else if (levelDifference < 0) {
    // Multiply credits if player is lower level
    credits = credits * Math.abs(levelDifference);
  }

  return {
    essence: essenceReward,
    credits: Math.max(1, credits) // Minimum 1 credit
  };
} 