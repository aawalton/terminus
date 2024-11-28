import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TreeGameState,
  CurrentTreeGameState,
  TreeGameStateCalculated,
  DEFAULT_GAME_STATE,
  migrateGameState,
  getCultivationStage,
  calculateAgeInDays,
  calculateMaxEssence,
  calculateTotalEssenceGeneration,
} from '@terminus/idle-tree';

const GAME_STATE_KEY = '@idle_tree_game_state';

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
    essenceRecoveryPerMinute: calculateTotalEssenceGeneration(gameState),
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
    try {
      const updatedState = { ...gameState, ...newState };
      setGameState(updatedState);
      await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(updatedState));
      return true;
    } catch (error) {
      console.error('Error saving game state:', error)
      return false;
    }
  };

  const updateGameState = async (loadedState?: CurrentTreeGameState) => {
    const state = loadedState || gameState;
    const now = new Date();

    const essenceGainedAt = new Date(state.essenceGainedAt);
    const minutesPassed = Math.floor((now.getTime() - essenceGainedAt.getTime()) / 60000);
    const essenceToAdd = BigInt(minutesPassed) * BigInt(calculateTotalEssenceGeneration(state));
    const newEssence = BigInt(state.currentEssence) + essenceToAdd;

    const maxEssence = calculateMaxEssence(state.currentLevel);
    const updatedEssence = newEssence > maxEssence ? maxEssence : newEssence;

    const dailyCreditsGainedAt = new Date(state.dailyCreditsGainedAt);
    const hoursPassed = Math.floor((now.getTime() - dailyCreditsGainedAt.getTime()) / 3600000);
    const newDailyCredits = state.dailyCredits + hoursPassed;

    const newEssenceGainedAt = new Date(now);
    newEssenceGainedAt.setSeconds(0, 0);
    const newDailyCreditsGainedAt = new Date(now);
    newDailyCreditsGainedAt.setMinutes(0, 0, 0);

    await saveGame({
      ...state,
      currentEssence: updatedEssence.toString(),
      dailyCredits: newDailyCredits,
      essenceGainedAt: newEssenceGainedAt.toISOString(),
      dailyCreditsGainedAt: newDailyCreditsGainedAt.toISOString(),
    });
  };

  const updateAllocation = async (zoneId: string, amount: string) => {
    const newState = {
      ...gameState,
      rootEssenceAllocation: {
        ...gameState.rootEssenceAllocation,
        [zoneId]: amount
      }
    };
    await saveGame(newState);
  };

  return {
    gameState: calculatedState,
    loading,
    saveGame,
    updateAllocation,
  };
} 