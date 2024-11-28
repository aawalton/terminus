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
    gameState: calculatedState,
    loading,
    saveGame,
  };
} 