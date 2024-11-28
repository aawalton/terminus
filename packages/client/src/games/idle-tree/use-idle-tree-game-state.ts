import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_STATE_KEY = '@idle_tree_game_state';

// Define base interface
interface TreeGameStateV1 {
  treeName: string | null;
  currentLevel: number;
  maxEssence: string;
  currentEssence: string;
  essenceRecoveryPerMinute: string;
  essenceGainedAt: string; // timestamp
  dailyCredits: number;
  dailyCreditsGainedAt: string; // timestamp
  stateVersion: 1;
}

// V2 adds createdAt and changes version
type TreeGameStateV2 = Omit<TreeGameStateV1, 'stateVersion'> & {
  createdAt: string;
  stateVersion: 2;
};

// V3 removes maxEssence and changes version
type TreeGameStateV3 = Omit<TreeGameStateV2, 'maxEssence' | 'stateVersion'> & {
  stateVersion: 3;
};

type TreeGameState = TreeGameStateV1 | TreeGameStateV2 | TreeGameStateV3;

type CurrentTreeGameState = TreeGameStateV3;

const DEFAULT_GAME_STATE: CurrentTreeGameState = {
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

// Update migration function
const migrateGameState = (state: TreeGameState): CurrentTreeGameState => {
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

// Add the cultivation stages mapping function
function getCultivationStage(level: number): string {
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

// Add new interface for calculated values
interface TreeGameStateCalculated extends CurrentTreeGameState {
  ageInDays: number;
  cultivationStage: string;
  maxEssence: string;
}

// Add helper function to calculate age
function calculateAgeInDays(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 3600000);
}

// Add these functions before useIdleTreeGameState

function getFibonacciEssence(level: number): bigint {
  if (level === 0) return BigInt(100); // Mortal
  if (level === 1) return BigInt(200); // First level of Essence Gathering
  if (level === 2) return BigInt(300); // Second level of Essence Gathering

  // For level 3 and above, follow Fibonacci sequence starting with 300, 500
  let prev = BigInt(300);
  let current = BigInt(500);

  for (let i = 3; i <= level; i++) {
    const next = prev + current;
    prev = current;
    current = next;
  }

  return current;
}

function calculateMaxEssence(level: number): bigint {
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

export function useIdleTreeGameState() {
  const [gameState, setGameState] = useState<CurrentTreeGameState>(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Calculate derived state
  const calculatedState: TreeGameStateCalculated = {
    ...gameState,
    ageInDays: calculateAgeInDays(gameState.createdAt),
    cultivationStage: getCultivationStage(gameState.currentLevel),
    maxEssence: calculateMaxEssence(gameState.currentLevel).toString(),
  };

  useEffect(() => {
    loadGame();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => updateGameState(), 60000);
    return () => clearInterval(intervalId);
  }, [isLoaded]);

  const loadGame = async () => {
    try {
      const savedState = await AsyncStorage.getItem(GAME_STATE_KEY);
      if (savedState) {
        let parsedState: TreeGameState = JSON.parse(savedState);

        // Migrate state if necessary
        parsedState = migrateGameState(parsedState);

        parsedState.currentEssence = BigInt(parsedState.currentEssence).toString();
        parsedState.essenceRecoveryPerMinute = BigInt(parsedState.essenceRecoveryPerMinute).toString();
        updateGameState(parsedState);
      } else {
        setGameState(DEFAULT_GAME_STATE);
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  };

  const saveGame = async (newState: CurrentTreeGameState) => {
    const updatedState = { ...gameState, ...newState };
    setGameState(updatedState);
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify({
      ...updatedState,
      currentEssence: updatedState.currentEssence.toString(),
      essenceRecoveryPerMinute: updatedState.essenceRecoveryPerMinute.toString(),
    }));
    return true;
  };

  const updateGameState = async (loadedState?: CurrentTreeGameState) => {
    const state = loadedState || gameState;
    const now = new Date();

    // Calculate age in days (1 day = 1 hour)
    const createdAt = new Date(state.createdAt);
    const ageInHours = Math.floor((now.getTime() - createdAt.getTime()) / 3600000);
    const ageInDays = ageInHours;

    // Update essence
    const essenceGainedAt = new Date(state.essenceGainedAt);
    const minutesPassed = Math.floor((now.getTime() - essenceGainedAt.getTime()) / 60000);
    const essenceToAdd = BigInt(minutesPassed) * BigInt(state.essenceRecoveryPerMinute);
    const newEssence = BigInt(state.currentEssence) + essenceToAdd;

    // Ensure new essence does not exceed max essence
    const maxEssence = calculateMaxEssence(state.currentLevel);
    const updatedEssence = newEssence > maxEssence ? maxEssence : newEssence;

    // Update daily credits
    const dailyCreditsGainedAt = new Date(state.dailyCreditsGainedAt);
    const hoursPassed = Math.floor((now.getTime() - dailyCreditsGainedAt.getTime()) / 3600000);
    const newDailyCredits = state.dailyCredits + hoursPassed;

    // Update timestamps
    const newEssenceGainedAt = new Date(now);
    newEssenceGainedAt.setSeconds(0, 0); // Truncate to the minute
    const newDailyCreditsGainedAt = new Date(now);
    newDailyCreditsGainedAt.setMinutes(0, 0, 0); // Truncate to the hour

    // Log the updates
    console.log(`Updating game state...`);
    console.log(`Essence gained: ${essenceToAdd.toString()} (Total: ${updatedEssence.toString()})`);
    console.log(`Daily credits gained: ${hoursPassed} (Total: ${newDailyCredits})`);

    // Save updated state with recalculated age if needed
    await saveGame({
      ...state,
      currentEssence: updatedEssence.toString(),
      dailyCredits: newDailyCredits,
      essenceGainedAt: newEssenceGainedAt.toISOString(),
      dailyCreditsGainedAt: newDailyCreditsGainedAt.toISOString(),
    });
  };

  return {
    gameState: calculatedState, // Now returning the augmented state
    loading,
    saveGame,
  };
} 