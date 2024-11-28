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
  const tiers = [
    { name: 'Mortal', startLevel: 0, maxStage: 0 },
    { name: 'Essence Gathering', startLevel: 1, maxStage: 9 },
    { name: 'Soul Fire', startLevel: 14, maxStage: 9 },
    { name: 'Star Core', startLevel: 23, maxStage: 9 },
    { name: 'Nascent Soul', startLevel: 32, maxStage: 9 },
    { name: 'Monarch', startLevel: 41, maxStage: 9 },
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    const tier = tiers[i];
    if (level >= tier.startLevel) {
      const stageNumber = tier.maxStage === 0 ? 0 : Math.min(level - tier.startLevel + 1, tier.maxStage);
      return tier.maxStage === 0 ? tier.name : `${tier.name} ${stageNumber}`;
    }
  }

  return 'Unknown';
}

export function calculateAgeInDays(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 3600000);
}

export function getFibonacciEssence(level: number): bigint {
  if (level === 0) return BigInt(100); // Mortal
  if (level === 1) return BigInt(200); // First level of Essence Gathering
  if (level === 2) return BigInt(300); // Second level of Essence Gathering

  // For level 3 and above, follow Fibonacci sequence starting with 300, 500
  let prev = BigInt(200);
  let current = BigInt(300);

  for (let i = 3; i <= level; i++) {
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