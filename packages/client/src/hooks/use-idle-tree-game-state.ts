import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAME_STATE_KEY = '@idle_tree_game_state';

// Define versioned interfaces
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

interface TreeGameStateV2 {
  treeName: string | null;
  currentLevel: number;
  maxEssence: string;
  currentEssence: string;
  essenceRecoveryPerMinute: string;
  essenceGainedAt: string; // timestamp
  dailyCredits: number;
  dailyCreditsGainedAt: string; // timestamp
  createdAt: string; // New field for creation timestamp
  stateVersion: 2;
}

type TreeGameState = TreeGameStateV1 | TreeGameStateV2;

type CurrentTreeGameState = TreeGameStateV2;

const DEFAULT_GAME_STATE: CurrentTreeGameState = {
  treeName: null,
  currentLevel: 0,
  maxEssence: '100',
  currentEssence: '10',
  essenceRecoveryPerMinute: '1',
  essenceGainedAt: new Date().toISOString(),
  dailyCredits: 1,
  dailyCreditsGainedAt: new Date().toISOString(),
  stateVersion: 2,
  createdAt: new Date().toISOString(),
};

// Update migration function
const migrateGameState = (state: TreeGameState): CurrentTreeGameState => {
  switch (state.stateVersion) {
    case 1:
      return {
        ...state,
        createdAt: new Date().toISOString(),
        stateVersion: 2,
      };
    case 2:
      return state as TreeGameStateV2;
    default:
      throw new Error(`Unsupported state version: ${state['stateVersion']}`);
  }
};

export function useIdleTreeGameState() {
  const [gameState, setGameState] = useState<CurrentTreeGameState>(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
    const intervalId = setInterval(() => updateGameState(), 60000); // Update every minute
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const loadGame = async () => {
    try {
      const savedState = await AsyncStorage.getItem(GAME_STATE_KEY);
      if (savedState) {
        let parsedState: TreeGameState = JSON.parse(savedState);

        // Migrate state if necessary
        parsedState = migrateGameState(parsedState);

        parsedState.maxEssence = BigInt(parsedState.maxEssence).toString();
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
    }
  };

  const saveGame = async (newState: CurrentTreeGameState) => {
    const updatedState = { ...gameState, ...newState };
    setGameState(updatedState);
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify({
      ...updatedState,
      maxEssence: updatedState.maxEssence.toString(),
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
    const maxEssence = BigInt(state.maxEssence);
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
    gameState,
    loading,
    saveGame,
  };
} 