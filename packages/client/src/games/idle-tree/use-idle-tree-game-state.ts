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
  worlds,
} from '@terminus/idle-tree';

const GAME_STATE_KEY = '@idle_tree_game_state';

export function useIdleTreeGameState() {
  const [gameState, setGameState] = useState<CurrentTreeGameState>(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const calculateDerivedState = (state: CurrentTreeGameState): TreeGameStateCalculated => ({
    ...state,
    ageInDays: calculateAgeInDays(state.createdAt),
    cultivationStage: getCultivationStage(state.currentLevel),
    maxEssence: calculateMaxEssence(state.currentLevel).toString(),
    essenceRecoveryPerMinute: calculateTotalEssenceGeneration(state),
    totalAllocation: calculateTotalAllocation(state),
    netGeneration: calculateNetGeneration(state),
  });

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

    // 1. Calculate essence gain from net generation
    const netEssenceToAdd = BigInt(minutesPassed) * BigInt(calculateNetGeneration(state));
    let newEssence = BigInt(state.currentEssence) + netEssenceToAdd;

    // 2. Process allocated essence for each active allocation
    const newRootSaturation = { ...state.rootSaturation };
    const newAllocation = { ...state.rootEssenceAllocation };
    let surplusEssence = BigInt(0);

    const world = worlds[0]; // Currently only using Midgard
    const zoneMap = new Map(
      world.regions.flatMap(region =>
        region.zones.map(zone => [zone.id, zone])
      )
    );

    // Process only zones that have allocations
    Object.entries(state.rootEssenceAllocation).forEach(([zoneId, allocationAmount]) => {
      const allocation = BigInt(allocationAmount);
      if (allocation > 0) {
        const zone = zoneMap.get(zoneId);
        if (zone) {
          const essenceAllocated = allocation * BigInt(minutesPassed);
          const currentSaturation = BigInt(newRootSaturation[zoneId] || '0');
          const maxSaturation = BigInt(zone.size) * BigInt(zone.density) * BigInt(zone.difficulty);

          const remainingCapacity = maxSaturation - currentSaturation;
          const absorbed = remainingCapacity < essenceAllocated ? remainingCapacity : essenceAllocated;

          const newSaturation = currentSaturation + absorbed;
          newRootSaturation[zoneId] = newSaturation.toString();

          // Reset allocation if zone is now saturated
          if (newSaturation >= maxSaturation) {
            delete newAllocation[zoneId];
          }

          if (essenceAllocated > absorbed) {
            surplusEssence += (essenceAllocated - absorbed);
          }
        }
      }
    });

    // 3. Add surplus essence back to total
    newEssence += surplusEssence;

    // 4. Cap essence at max
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
      rootSaturation: newRootSaturation,
      rootEssenceAllocation: newAllocation,
      dailyCredits: newDailyCredits,
      essenceGainedAt: newEssenceGainedAt.toISOString(),
      dailyCreditsGainedAt: newDailyCreditsGainedAt.toISOString(),
    });
  };

  const updateAllocation = async (zoneId: string, amount: string) => {
    const newAllocation = { ...gameState.rootEssenceAllocation };

    if (amount === '0') {
      // Remove zero allocations from the map
      delete newAllocation[zoneId];
    } else {
      newAllocation[zoneId] = amount;
    }

    const newState = {
      ...gameState,
      rootEssenceAllocation: newAllocation
    };

    setGameState(newState);
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(newState));
  };

  return {
    gameState: calculatedState,
    loading,
    saveGame,
    updateAllocation,
  };
} 