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
  calculateTotalAllocation,
  calculateNetGeneration,
} from '@terminus/idle-tree';

const GAME_STATE_KEY = '@idle_tree_game_state';

export function useIdleTreeGameState() {
  const [gameState, setGameState] = useState<CurrentTreeGameState>(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Move the calculation into a function so we can reuse it
  const calculateDerivedState = (state: CurrentTreeGameState): TreeGameStateCalculated => {
    console.log('Calculating derived state:', {
      currentEssence: state.currentEssence,
      rootEssenceAllocation: state.rootEssenceAllocation
    });

    const calculated = {
      ...state,
      ageInDays: calculateAgeInDays(state.createdAt),
      cultivationStage: getCultivationStage(state.currentLevel),
      maxEssence: calculateMaxEssence(state.currentLevel).toString(),
      essenceRecoveryPerMinute: calculateTotalEssenceGeneration(state),
      totalAllocation: calculateTotalAllocation(state),
      netGeneration: calculateNetGeneration(state),
    };

    console.log('Derived state calculated:', {
      totalAllocation: calculated.totalAllocation,
      netGeneration: calculated.netGeneration
    });

    return calculated;
  };

  // Calculate derived state
  const calculatedState = calculateDerivedState(gameState);

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
    console.log('updateAllocation called:', { zoneId, amount });

    const newState = {
      ...gameState,
      rootEssenceAllocation: {
        ...gameState.rootEssenceAllocation,
        [zoneId]: amount
      }
    };

    console.log('Setting new state:', {
      oldAllocation: gameState.rootEssenceAllocation,
      newAllocation: newState.rootEssenceAllocation
    });

    setGameState(newState); // Immediately update the state
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(newState)); // Save in background
  };

  // Add an effect to log state changes
  useEffect(() => {
    console.log('gameState changed:', {
      rootEssenceAllocation: gameState.rootEssenceAllocation
    });
  }, [gameState]);

  return {
    gameState: calculatedState,
    loading,
    saveGame,
    updateAllocation,
  };
} 