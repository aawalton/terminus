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
} from './idle-tree-types';

interface CultivationStage {
  tier: string;
  name: string;
  essence: bigint;
}

export const CULTIVATION_STAGES: CultivationStage[] = [
  { tier: 'Mortal', name: 'Mortal', essence: BigInt(100) },

  // Essence Gathering Tier
  { tier: 'Essence Gathering', name: 'Essence Gathering 1', essence: BigInt(200) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 2', essence: BigInt(300) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 3', essence: BigInt(500) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 4', essence: BigInt(800) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 5', essence: BigInt(1300) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 6', essence: BigInt(2100) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 7', essence: BigInt(3400) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 8', essence: BigInt(5500) },
  { tier: 'Essence Gathering', name: 'Essence Gathering 9', essence: BigInt(8900) },

  // Soul Fire Tier
  { tier: 'Soul Fire', name: 'Soul Fire 1', essence: BigInt(14400) },
  { tier: 'Soul Fire', name: 'Soul Fire 2', essence: BigInt(23300) },
  { tier: 'Soul Fire', name: 'Soul Fire 3', essence: BigInt(37700) },
  { tier: 'Soul Fire', name: 'Soul Fire 4', essence: BigInt(61000) },
  { tier: 'Soul Fire', name: 'Soul Fire 5', essence: BigInt(98700) },
  { tier: 'Soul Fire', name: 'Soul Fire 6', essence: BigInt(159700) },
  { tier: 'Soul Fire', name: 'Soul Fire 7', essence: BigInt(258400) },
  { tier: 'Soul Fire', name: 'Soul Fire 8', essence: BigInt(418100) },
  { tier: 'Soul Fire', name: 'Soul Fire 9', essence: BigInt(676500) },

  // Star Core Tier
  { tier: 'Star Core', name: 'Star Core 1', essence: BigInt(1094600) },
  { tier: 'Star Core', name: 'Star Core 2', essence: BigInt(1771100) },
  { tier: 'Star Core', name: 'Star Core 3', essence: BigInt(2865700) },
  { tier: 'Star Core', name: 'Star Core 4', essence: BigInt(4636800) },
  { tier: 'Star Core', name: 'Star Core 5', essence: BigInt(7502500) },
  { tier: 'Star Core', name: 'Star Core 6', essence: BigInt(12139300) },
  { tier: 'Star Core', name: 'Star Core 7', essence: BigInt(19641800) },
  { tier: 'Star Core', name: 'Star Core 8', essence: BigInt(31781100) },
  { tier: 'Star Core', name: 'Star Core 9', essence: BigInt(51422900) },

  // Nascent Soul Tier
  { tier: 'Nascent Soul', name: 'Nascent Soul 1', essence: BigInt(83204000) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 2', essence: BigInt(134626900) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 3', essence: BigInt(217830900) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 4', essence: BigInt(352457800) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 5', essence: BigInt(570288700) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 6', essence: BigInt(922746500) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 7', essence: BigInt(1493035200) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 8', essence: BigInt(2415781700) },
  { tier: 'Nascent Soul', name: 'Nascent Soul 9', essence: BigInt(3908816900) },

  // Monarch Tier
  { tier: 'Monarch', name: 'Monarch 1', essence: BigInt(6324598600) },
  { tier: 'Monarch', name: 'Monarch 2', essence: BigInt(10233415500) },
  { tier: 'Monarch', name: 'Monarch 3', essence: BigInt(16558014100) },
  { tier: 'Monarch', name: 'Monarch 4', essence: BigInt(26791429600) },
  { tier: 'Monarch', name: 'Monarch 5', essence: BigInt(43349443700) },
  { tier: 'Monarch', name: 'Monarch 6', essence: BigInt(70140873300) },
  { tier: 'Monarch', name: 'Monarch 7', essence: BigInt(113490317000) },
  { tier: 'Monarch', name: 'Monarch 8', essence: BigInt(183631190300) },
  { tier: 'Monarch', name: 'Monarch 9', essence: BigInt(297121507300) }
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