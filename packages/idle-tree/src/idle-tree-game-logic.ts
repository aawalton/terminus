/**
 * Idle Tree Cultivation System
 * 
 * Players progress through cultivation tiers and stages by accumulating essence.
 * Each stage requires more essence than the last, following a Fibonacci-like sequence.
 * 
 * Cultivation Tiers (in order):
 * 1. Mortal (single stage)
 * 2. Essence Gathering (9 stages)
 * 3. Soul Fire (9 stages)
 * 4. Star Core (9 stages)
 * 5. Nascent Soul (9 stages)
 * 6. Monarch (9 stages)
 * 
 * 7. Between each tier is a 
 */

import {
  TreeGameState,
  CurrentTreeGameState,
  CultivationStage,
} from './idle-tree-types';
import cultivationStagesConfig from '../config/cultivation-stages.json';
import { worlds } from './worlds';

// Convert JSON stages to CultivationStage array with BigInt values
export const CULTIVATION_STAGES: CultivationStage[] = cultivationStagesConfig.stages.map(stage => ({
  ...stage,
  essence: BigInt(stage.essence)
}));

export const DEFAULT_GAME_STATE: CurrentTreeGameState = {
  treeName: null,
  currentLevel: 0,
  currentEssence: '10',
  essenceRecoveryPerMinute: '1',
  essenceGainedAt: new Date().toISOString(),
  dailyCredits: 1,
  dailyCreditsGainedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  rootSaturation: {
    'midgard-0-0': '59', // Spirit Meadow Vale's difficulty
  },
  stateVersion: 4,
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
      return migrateGameState({
        ...stateWithoutMaxEssence,
        stateVersion: 3,
      });
    case 3:
      // Migrate to V4 by adding rootSaturation
      return {
        ...state,
        rootSaturation: {
          'midgard-0-0': '59', // Spirit Meadow Vale's difficulty
        },
        stateVersion: 4,
      };
    case 4:
      return state;
    default:
      throw new Error(`Unsupported state version: ${state['stateVersion']}`);
  }
};

export function getCultivationStage(level: number): string {
  if (level >= CULTIVATION_STAGES.length) {
    const lastStage = CULTIVATION_STAGES[CULTIVATION_STAGES.length - 1];
    return lastStage.name;
  }
  return CULTIVATION_STAGES[level].name;
}

export function calculateAgeInDays(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 3600000);
}

export function calculateMaxEssence(level: number): bigint {
  const tiers = [
    { name: 'Mortal', startIndex: 0, maxStage: 0 },
    { name: 'Essence Gathering', startIndex: 1, maxStage: 9 },
    { name: 'Soul Fire', startIndex: 10, maxStage: 9 },
    { name: 'Star Core', startIndex: 19, maxStage: 9 },
    { name: 'Nascent Soul', startIndex: 28, maxStage: 9 },
    { name: 'Monarch', startIndex: 37, maxStage: 9 },
  ];

  // Find current tier
  let currentTier = tiers[0];
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (level >= currentTier.startIndex) {
      currentTier = tiers[i];
      break;
    }
  }

  // If we're at a level between tiers, sum the previous 5 stage requirements
  const nextTierIndex = tiers.findIndex(t => t === currentTier) + 1;
  if (nextTierIndex < tiers.length) {
    const nextTier = tiers[nextTierIndex];
    if (level >= currentTier.startIndex + currentTier.maxStage + 1 &&
      level < nextTier.startIndex) {
      let sum = BigInt(0);
      const baseLevel = Math.min(level, CULTIVATION_STAGES.length - 1);
      for (let i = 0; i < 5; i++) {
        const stageIndex = Math.max(0, baseLevel - i);
        sum += CULTIVATION_STAGES[stageIndex].essence;
      }
      return sum;
    }
  }

  // Regular level within a tier
  const stageIndex = Math.min(level, CULTIVATION_STAGES.length - 1);
  return CULTIVATION_STAGES[stageIndex].essence;
}

export function canAdvanceCultivation(currentLevel: number, currentEssence: bigint): boolean {
  const maxEssence = calculateMaxEssence(currentLevel);
  return currentEssence >= maxEssence;
}

export function advanceCultivation(gameState: CurrentTreeGameState): CurrentTreeGameState {
  return {
    ...gameState,
    currentLevel: gameState.currentLevel + 1,
    currentEssence: "0",
  };
}

export function calculateZoneExploration(
  essenceInvested: string,
  size: number,
  density: number,
  difficulty: number
): number {
  const invested = BigInt(essenceInvested || '0');
  const total = BigInt(size) * BigInt(density) * BigInt(difficulty);
  // Convert to percentage with 2 decimal places
  return Number((invested * BigInt(10000) / total)) / 100;
}

export function calculateZoneEssenceGeneration(
  essenceInvested: string,
  difficulty: number
): number {
  const invested = BigInt(essenceInvested || '0');
  return Number(invested / BigInt(difficulty));
} 