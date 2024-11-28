/**
 * Idle Tree Cultivation System
 * 
 * Players progress through cultivation tiers and stages by accumulating essence.
 * 
 * Cultivation Tiers (in order):
 * 1. Mortal (single stage)
 * 2. Essence Gathering (9 stages)
 * 3. Soul Fire (9 stages)
 * 4. Star Core (9 stages)
 * 5. Nascent Soul (9 stages)
 * 6. Monarch (9 stages)
 * 
 * Essence Requirements:
 * - Regular stages follow a Fibonacci sequence starting at:
 *   - Level 0 (Mortal): 100 essence
 *   - Level 1 (EG 1): 200 essence  
 *   - Level 2 (EG 2): 300 essence
 *   - Level 3+ follows Fibonacci: 500, 800, 1300, etc.
 * 
 * - Advancing between tiers (breakthrough levels) requires essence equal to
 *   the sum of the previous 5 stage requirements
 */

import {
  TreeGameState,
  CurrentTreeGameState,
} from './idle-tree-types';

interface CultivationStage {
  tier: string;
  name: string;
  level: number;
  essence: bigint;
}

const CULTIVATION_STAGES: CultivationStage[] = [
  { tier: 'Mortal', name: 'Mortal', level: 0, essence: BigInt(100) },

  // Essence Gathering Tier
  { tier: 'Essence Gathering', name: 'Essence Gathering 1', level: 1, essence: BigInt(200) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 2', level: 2, essence: BigInt(300) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 3', level: 3, essence: BigInt(500) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 4', level: 4, essence: BigInt(800) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 5', level: 5, essence: BigInt(1300) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 6', level: 6, essence: BigInt(2100) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 7', level: 7, essence: BigInt(3400) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 8', level: 8, essence: BigInt(5500) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 9', level: 9, essence: BigInt(8900) },

  // Breakthrough to Soul Fire
  { tier: 'Breakthrough', name: 'Breakthrough to Soul Fire', level: 10, essence: BigInt(21200) },

  // Soul Fire Tier starts at level 14
  { tier: 'Soul Fire', name: 'Soul Fire 1', level: 14, essence: BigInt(14400) },
  { tier: 'Soul Fire', name: 'Soul Fire 2', level: 15, essence: BigInt(23300) },
  { tier: 'Soul Fire', name: 'Soul Fire 3', level: 16, essence: BigInt(37700) },
  { tier: 'Soul Fire', name: 'Soul Fire 4', level: 17, essence: BigInt(61000) },
  { tier: 'Soul Fire', name: 'Soul Fire 5', level: 18, essence: BigInt(98700) },
  { tier: 'Soul Fire', name: 'Soul Fire 6', level: 19, essence: BigInt(159700) },
  { tier: 'Soul Fire', name: 'Soul Fire 7', level: 20, essence: BigInt(258400) },
  { tier: 'Soul Fire', name: 'Soul Fire 8', level: 21, essence: BigInt(418100) },
  { tier: 'Soul Fire', name: 'Soul Fire 9', level: 22, essence: BigInt(676500) },

  // Continue pattern for other tiers...
];

export const DEFAULT_GAME_STATE: CurrentTreeGameState = {
  treeName: null,
  currentLevel: 0,
  currentEssence: '10',
  essenceRecoveryPerMinute: '1',
  essenceGainedAt: new Date().toISOString(),
  dailyCredits: 1,
  dailyCreditsGainedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  stateVersion: 3,
};

export const migrateGameState = (state: TreeGameState): CurrentTreeGameState => {
  switch (state.stateVersion) {
    case 1:
      return migrateGameState({
        ...state,
        createdAt: new Date().toISOString(),
        stateVersion: 2,
      });
    case 2:
      // Migrate to V3 by removing maxEssence
      const { maxEssence, ...stateWithoutMaxEssence } = state;
      return {
        ...stateWithoutMaxEssence,
        stateVersion: 3,
      };
    case 3:
      return state;
    default:
      throw new Error(`Unsupported state version: ${state['stateVersion']}`);
  }
};

export function getCultivationStage(level: number): string {
  const stage = CULTIVATION_STAGES.find(s => s.level === level);
  if (stage) {
    return stage.name;
  }

  // Fallback for levels not explicitly defined
  const lastMatchingStage = [...CULTIVATION_STAGES]
    .reverse()
    .find(s => level >= s.level);

  return lastMatchingStage?.name ?? 'Unknown';
}

export function calculateAgeInDays(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 3600000);
}

export function getFibonacciEssence(level: number): bigint {
  const stage = CULTIVATION_STAGES.find(s => s.level === level);
  if (stage) {
    return stage.essence;
  }

  // Fallback for levels not explicitly defined
  // This maintains compatibility with existing code
  const lastStage = CULTIVATION_STAGES[CULTIVATION_STAGES.length - 1];
  let prev = CULTIVATION_STAGES[CULTIVATION_STAGES.length - 2].essence;
  let current = lastStage.essence;

  for (let i = lastStage.level + 1; i <= level; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }

  return current;
}

export function calculateMaxEssence(level: number): bigint {
  const tiers = [
    { name: 'Mortal', startLevel: 0, maxStage: 0 },
    { name: 'Essence Gathering', startLevel: 1, maxStage: 9 },
    { name: 'Soul Fire', startLevel: 14, maxStage: 9 },
    { name: 'Star Core', startLevel: 23, maxStage: 9 },
    { name: 'Nascent Soul', startLevel: 32, maxStage: 9 },
    { name: 'Monarch', startLevel: 41, maxStage: 9 },
  ];

  // Find current tier
  let currentTier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (level >= tiers[i].startLevel) {
      currentTier = tiers[i];
      break;
    }
  }

  // If we're at a level between tiers (e.g., levels 10-13 between EG and SF)
  const nextTierIndex = tiers.findIndex(t => t === currentTier) + 1;
  if (nextTierIndex < tiers.length) {
    const nextTier = tiers[nextTierIndex];
    if (level >= currentTier.startLevel + currentTier.maxStage + 1 &&
      level < nextTier.startLevel) {
      // Sum the last 5 Fibonacci numbers
      let sum = BigInt(0);
      for (let i = 0; i < 5; i++) {
        sum += getFibonacciEssence(level - i);
      }
      return sum;
    }
  }

  // Regular level within a tier
  return getFibonacciEssence(level);
} 