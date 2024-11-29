import { useState, useEffect } from 'react';
import {
  CurrentTreeGameState,
  TreeGameStateCalculated,
  DEFAULT_GAME_STATE,
  calculateMaxEssence,
  calculateNetGeneration,
  calculateMaxZonePrey,
  calculatePreyGenerationProbability,
} from '@terminus/idle-tree';
import { IdleTreeCloudService } from './idle-tree-cloud-service';
import { worlds, Zone } from '@terminus/idle-tree';
import {
  calculateAgeInDays,
  calculateTotalEssenceGeneration,
  calculateTotalAllocation,
  getCultivationStage,
  generateCreature,
  calculateHuntingRewards,
  calculateNewPrey
} from '@terminus/idle-tree';

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

    const intervalId = setInterval(async () => {
      const currentState = gameState;
      const newState = await updateGameState(currentState);
      if (newState) {
        setGameState(newState);
      }
    }, 6000);
    return () => clearInterval(intervalId);
  }, [isLoaded, gameState]);

  const loadGame = async () => {
    try {
      const cloudState = await IdleTreeCloudService.loadCloudSave()

      if (cloudState) {
        cloudState.currentEssence = BigInt(cloudState.currentEssence).toString()
        updateGameState(cloudState)
      } else {
        setGameState(DEFAULT_GAME_STATE)
      }
    } catch (error) {
      console.error('Error loading game state:', error)
    } finally {
      setLoading(false)
      setIsLoaded(true)
    }
  }

  const saveGame = async (newState: CurrentTreeGameState) => {
    try {
      setGameState(newState);
      const success = await IdleTreeCloudService.saveGameState(newState);

      if (!success) {
        console.error('Failed to save game state to cloud');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  };

  const updateGameState = async (state: CurrentTreeGameState) => {
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

    // 5. Update daily credits
    const dailyCreditsGainedAt = new Date(state.dailyCreditsGainedAt);
    const hoursPassed = Math.floor((now.getTime() - dailyCreditsGainedAt.getTime()) / 3600000);
    const newDailyCredits = state.dailyCredits + hoursPassed;

    // 6. Update prey counts
    const preyCheckedAt = new Date(state.preyCheckedAt);
    const preyMinutesPassed = Math.floor((now.getTime() - preyCheckedAt.getTime()) / 60000);
    const newPrey = { ...state.zonePrey };

    // Process prey generation for each zone
    for (const [zoneId, zone] of zoneMap) {
      const currentPrey = newPrey[zoneId] || '0';
      const rootSaturation = newRootSaturation[zoneId] || '0';
      const maxPrey = calculateMaxZonePrey(zone, rootSaturation);
      const probability = calculatePreyGenerationProbability(zone, rootSaturation);

      const addedPrey = calculateNewPrey(zone, rootSaturation, currentPrey, preyMinutesPassed);
      if (addedPrey > 0) {
        console.log('Added prey:', {
          zoneId,
          addedPrey,
        });
        newPrey[zoneId] = (Number(currentPrey) + addedPrey).toString();
      }
    }

    const newEssenceGainedAt = new Date(now);
    newEssenceGainedAt.setSeconds(0, 0);
    const newDailyCreditsGainedAt = new Date(now);
    newDailyCreditsGainedAt.setMinutes(0, 0, 0);
    const newPreyCheckedAt = new Date(now);
    newPreyCheckedAt.setSeconds(0, 0);

    const newState = {
      ...state,
      currentEssence: updatedEssence.toString(),
      rootSaturation: newRootSaturation,
      rootEssenceAllocation: newAllocation,
      dailyCredits: newDailyCredits,
      essenceGainedAt: newEssenceGainedAt.toISOString(),
      dailyCreditsGainedAt: newDailyCreditsGainedAt.toISOString(),
      preyCheckedAt: newPreyCheckedAt.toISOString(),
      zonePrey: newPrey,
    };

    const success = await saveGame(newState);
    if (success) {
      return newState;  // Return the new state if save was successful
    }
    return null;  // Return null if save failed
  };

  const updateAllocation = async (zoneId: string, amount: string) => {
    const newAllocation = { ...gameState.rootEssenceAllocation };

    if (amount === '0') {
      delete newAllocation[zoneId];
    } else {
      newAllocation[zoneId] = amount;
    }

    const newState = {
      ...gameState,
      rootEssenceAllocation: newAllocation
    };

    await saveGame(newState);
  };

  const hunt = async (zone: Zone) => {
    try {
      // Verify we have prey available
      const currentPrey = Number(gameState.zonePrey[zone.id] || '0');
      if (currentPrey <= 0) {
        throw new Error('No prey available in this zone');
      }

      // Verify we can afford the hunt
      const huntingCost = BigInt(zone.difficulty);
      if (BigInt(gameState.currentEssence) < huntingCost) {
        throw new Error('Not enough essence to hunt');
      }

      // Generate creature and calculate rewards
      const creature = generateCreature(zone);
      const { essence: essenceReward, credits: creditsReward } = calculateHuntingRewards(
        creature,
        gameState.currentLevel
      );

      // Update prey count
      const newPrey = { ...gameState.zonePrey };
      newPrey[zone.id] = (currentPrey - 1).toString();

      // Update essence (deduct cost and add reward) and credits
      const newEssence = BigInt(gameState.currentEssence) - huntingCost + essenceReward;
      const maxEssence = calculateMaxEssence(gameState.currentLevel);

      // Cap the essence at max
      const cappedEssence = newEssence > maxEssence ? maxEssence : newEssence;
      const actualEssenceGained = cappedEssence - (BigInt(gameState.currentEssence) - huntingCost);
      const newSacrificalCredits = gameState.sacrificialCredits + creditsReward;

      // Save new state
      const success = await saveGame({
        ...gameState,
        currentEssence: cappedEssence.toString(),
        sacrificialCredits: newSacrificalCredits,
        zonePrey: newPrey,
      });

      if (!success) {
        throw new Error('Failed to save game state after hunting. Please try again.');
      }

      return {
        creature,
        essenceGained: actualEssenceGained,
        creditsGained: creditsReward,
        huntingCost,
      };
    } catch (error) {
      console.error('Error during hunting:', error);
      throw new Error(error instanceof Error ? error.message : 'An error occurred while hunting');
    }
  };

  return {
    gameState: calculatedState,
    loading,
    saveGame,
    updateAllocation,
    hunt,
  };
} 