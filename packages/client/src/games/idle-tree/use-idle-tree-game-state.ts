import { useState, useEffect } from 'react';
import {
  TreeGameState,
  CurrentTreeGameState,
  TreeGameStateCalculated,
  DEFAULT_GAME_STATE,
  getCultivationStage,
  calculateAgeInDays,
  calculateMaxEssence,
  calculateTotalEssenceGeneration,
  calculateTotalAllocation,
  calculateNetGeneration,
  worlds,
  Zone,
  getBaseHuntingCost,
  calculateHuntingCostIncrease,
  calculateHuntingCostReduction,
  calculateFinalHuntingCost,
  generateCreature,
  calculateHuntingRewards,
  calculateZoneExploration,
} from '@terminus/idle-tree';
import { IdleTreeCloudService } from './idle-tree-cloud-service'

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

    const intervalId = setInterval(() => {
      setGameState(currentState => {
        updateGameState(currentState);
        return currentState;
      });
    }, 60000);
    return () => clearInterval(intervalId);
  }, [isLoaded]);

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

    const dailyCreditsGainedAt = new Date(state.dailyCreditsGainedAt);
    const hoursPassed = Math.floor((now.getTime() - dailyCreditsGainedAt.getTime()) / 3600000);
    const newDailyCredits = state.dailyCredits + hoursPassed;

    const newEssenceGainedAt = new Date(now);
    newEssenceGainedAt.setSeconds(0, 0);
    const newDailyCreditsGainedAt = new Date(now);
    newDailyCreditsGainedAt.setMinutes(0, 0, 0);

    // Reduce hunting costs
    const newHuntingCosts = { ...state.zoneHuntingCosts };
    for (const [zoneId, cost] of Object.entries(newHuntingCosts)) {
      const zone = zoneMap.get(zoneId);
      if (zone) {
        const currentCost = BigInt(cost);
        const reduction = calculateHuntingCostReduction(zone);
        newHuntingCosts[zoneId] = Math.max(0, Number(currentCost - reduction)).toString();
      }
    }

    const newState = {
      ...state,
      currentEssence: updatedEssence.toString(),
      rootSaturation: newRootSaturation,
      rootEssenceAllocation: newAllocation,
      dailyCredits: newDailyCredits,
      essenceGainedAt: newEssenceGainedAt.toISOString(),
      dailyCreditsGainedAt: newDailyCreditsGainedAt.toISOString(),
      zoneHuntingCosts: newHuntingCosts,
    };

    await saveGame(newState);
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
      // Calculate hunting cost
      const exploration = calculateZoneExploration(
        gameState.rootSaturation[zone.id] || '0',
        zone.size,
        zone.density,
        zone.difficulty
      );
      const huntingCost = calculateFinalHuntingCost(
        BigInt(gameState.zoneHuntingCosts[zone.id] || '0'),
        exploration / 100
      );

      // Verify we can afford the hunt
      if (BigInt(gameState.currentEssence) < huntingCost) {
        throw new Error('Not enough essence to hunt');
      }

      // Generate creature and calculate rewards
      const creature = generateCreature(zone);
      const { essence: essenceReward, credits: creditsReward } = calculateHuntingRewards(
        creature,
        gameState.currentLevel
      );

      // Update hunting cost
      const newHuntingCosts = { ...gameState.zoneHuntingCosts };
      const currentCost = BigInt(newHuntingCosts[zone.id] || '0');
      newHuntingCosts[zone.id] = (currentCost + calculateHuntingCostIncrease(zone)).toString();

      // Update essence (deduct cost and add reward) and credits
      const newEssence = BigInt(gameState.currentEssence) - huntingCost + essenceReward;
      const newSacrificalCredits = gameState.sacrificialCredits + creditsReward;

      // Save new state
      const success = await saveGame({
        ...gameState,
        currentEssence: newEssence.toString(),
        sacrificialCredits: newSacrificalCredits,
        zoneHuntingCosts: newHuntingCosts,
      });

      if (!success) {
        throw new Error('Failed to save game state after hunting. Please try again.');
      }

      return {
        creature,
        essenceGained: essenceReward,
        creditsGained: creditsReward,
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