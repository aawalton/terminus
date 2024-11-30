import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ListItem, Button, Text } from '@rneui/themed';
import { useWorldData } from './use-world-data';
import { useIdleTree } from './idle-tree-context';
import { calculateZoneExploration, calculateZoneEssenceGeneration, isZoneSaturated, type Creature, type Zone, type CreatureSummary } from '@terminus/idle-tree';
import { Icon } from '@rneui/themed';
import { HuntingResultModal } from './hunting-result-modal';

export function RegionsList() {
  const { worldData, loading } = useWorldData();
  const { gameState, updateAllocation, hunt } = useIdleTree();
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});
  const [huntingResult, setHuntingResult] = useState<{
    visible: boolean;
    creatureSummaries?: CreatureSummary[];
    totalEssenceGained?: bigint;
    totalCreditsGained?: number;
    totalHuntingCost?: bigint;
  }>({
    visible: false,
    creatureSummaries: undefined,
    totalEssenceGained: undefined,
    totalCreditsGained: undefined,
    totalHuntingCost: undefined
  });

  if (loading || !worldData || !gameState) {
    return null;
  }

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

  const handleAllocationChange = (zoneId: string, delta: number) => {
    const currentAllocation = BigInt(gameState.rootEssenceAllocation[zoneId] || '0');
    const newAllocation = (currentAllocation + BigInt(delta)).toString();
    if (BigInt(newAllocation) >= 0) {
      updateAllocation(zoneId, newAllocation);
    }
  };

  const handleHunt = async (zone: Zone) => {
    try {
      const result = await hunt(zone);
      setHuntingResult({
        visible: true,
        creatureSummaries: result.creatureSummaries,
        totalEssenceGained: result.totalEssenceGained,
        totalCreditsGained: result.totalCreditsGained,
        totalHuntingCost: result.totalHuntingCost
      });
    } catch (error) {
      console.error('Error during hunting:', error);
      Alert.alert(
        'Hunting Failed',
        error instanceof Error ? error.message : 'An error occurred while hunting'
      );
    }
  };

  const canIncreaseAllocation = BigInt(gameState.netGeneration) > 0;

  const accessibleRegions = worldData.regions.filter(
    region => region.dangerLevel <= gameState.currentLevel
  );

  const hasLockedRegions = accessibleRegions.length < worldData.regions.length;

  return (
    <View style={styles.container}>
      <HuntingResultModal
        visible={huntingResult.visible}
        onClose={() => setHuntingResult({ visible: false })}
        creatureSummaries={huntingResult.creatureSummaries}
        totalEssenceGained={huntingResult.totalEssenceGained}
        totalCreditsGained={huntingResult.totalCreditsGained}
        totalHuntingCost={huntingResult.totalHuntingCost}
      />

      <ListItem.Accordion
        content={
          <ListItem.Content>
            <ListItem.Title style={styles.mainHeader}>
              Regions
            </ListItem.Title>
          </ListItem.Content>
        }
        isExpanded={isRegionsExpanded}
        onPress={() => setIsRegionsExpanded(!isRegionsExpanded)}
        containerStyle={styles.mainAccordion}
      >
        {accessibleRegions.map((region) => (
          <View key={region.id} style={styles.regionContainer}>
            <ListItem.Accordion
              content={
                <ListItem.Content>
                  <ListItem.Title style={styles.regionTitle}>
                    {region.name}
                  </ListItem.Title>
                </ListItem.Content>
              }
              isExpanded={expandedRegions[region.id]}
              onPress={() => toggleRegion(region.id)}
              containerStyle={styles.regionAccordion}
            >
              {region.zones.map((zone) => {
                const essenceInvested = gameState.rootSaturation[zone.id] || '0';
                const exploration = calculateZoneExploration(
                  essenceInvested,
                  zone.size,
                  zone.density,
                  zone.difficulty
                );
                const essenceGeneration = calculateZoneEssenceGeneration(
                  essenceInvested,
                  zone.difficulty
                );
                const currentAllocation = BigInt(gameState.rootEssenceAllocation[zone.id] || '0');
                const hasRoots = exploration > 0;
                const isSaturated = isZoneSaturated(essenceInvested, zone);

                const currentPrey = Number(gameState.zonePrey[zone.id] || '0');
                const huntingCostPerPrey = BigInt(region.dangerLevel);
                const totalHuntingCost = huntingCostPerPrey * BigInt(currentPrey);
                const canHunt = hasRoots && currentPrey > 0 && BigInt(gameState.currentEssence) >= totalHuntingCost;

                return (
                  <ListItem
                    key={zone.id}
                    bottomDivider
                    containerStyle={styles.zoneItem}
                  >
                    <ListItem.Content>
                      <ListItem.Title style={styles.zoneName}>
                        {zone.name}
                      </ListItem.Title>
                      <ListItem.Subtitle style={styles.zoneStats}>
                        Roots: {exploration.toFixed(2)}% • Generation: {essenceGeneration}/min
                      </ListItem.Subtitle>
                      <ListItem.Subtitle style={styles.zoneStats}>
                        Prey: {currentPrey} • Total Hunting Cost: {totalHuntingCost.toString()} essence
                      </ListItem.Subtitle>
                      {!isSaturated && (
                        <>
                          <ListItem.Subtitle style={styles.zoneStats}>
                            Allocated: {currentAllocation.toString()}/min
                          </ListItem.Subtitle>
                          <View style={styles.allocationContainer}>
                            {currentAllocation > 1 && (
                              <Button
                                title={`-${currentAllocation.toString()}`}
                                disabled={currentAllocation <= 0}
                                onPress={() => handleAllocationChange(zone.id, -Number(currentAllocation))}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                            <Button
                              title="-1"
                              disabled={currentAllocation <= 0}
                              onPress={() => handleAllocationChange(zone.id, -1)}
                              buttonStyle={styles.allocationButton}
                            />
                            {Number(gameState.netGeneration) > 0 && (
                              <Button
                                title="+1"
                                disabled={!canIncreaseAllocation}
                                onPress={() => handleAllocationChange(zone.id, 1)}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                            {Number(gameState.netGeneration) > 10 && (
                              <Button
                                title="+10"
                                disabled={!canIncreaseAllocation}
                                onPress={() => handleAllocationChange(zone.id, 10)}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                            {Number(gameState.netGeneration) > 100 && (
                              <Button
                                title="+100"
                                disabled={!canIncreaseAllocation}
                                onPress={() => handleAllocationChange(zone.id, 100)}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                            {Number(gameState.netGeneration) > 1000 && (
                              <Button
                                title="+1000"
                                disabled={!canIncreaseAllocation}
                                onPress={() => handleAllocationChange(zone.id, 1000)}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                            {Number(gameState.netGeneration) > 1 && (
                              <Button
                                title={`+${gameState.netGeneration}`}
                                disabled={!canIncreaseAllocation}
                                onPress={() => handleAllocationChange(zone.id, Number(gameState.netGeneration))}
                                buttonStyle={styles.allocationButton}
                              />
                            )}
                          </View>
                        </>
                      )}
                      {hasRoots && (
                        <View style={styles.huntingContainer}>
                          <Button
                            title={currentPrey === 1 ? "Hunt" : `Hunt All (${currentPrey})`}
                            disabled={!canHunt}
                            onPress={() => handleHunt(zone)}
                            buttonStyle={styles.huntButton}
                          />
                          {!canHunt && currentPrey === 0 && (
                            <Text style={styles.huntingCost}>
                              No prey available
                            </Text>
                          )}
                          {!canHunt && currentPrey > 0 && (
                            <Text style={styles.huntingCost}>
                              Need {totalHuntingCost.toString()} essence to hunt
                            </Text>
                          )}
                        </View>
                      )}
                    </ListItem.Content>
                  </ListItem>
                );
              })}
            </ListItem.Accordion>
          </View>
        ))}

        {hasLockedRegions && (
          <ListItem containerStyle={styles.lockedRegion}>
            <Icon name="lock" type="material" color="#666" />
            <ListItem.Content>
              <ListItem.Title style={styles.lockedText}>
                Advance your cultivation to unlock more regions
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        )}
      </ListItem.Accordion>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  mainHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mainAccordion: {
    padding: 0,
    backgroundColor: 'white',
    paddingRight: 16
  },
  regionContainer: {
    marginTop: 1,
  },
  regionAccordion: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 4,
  },
  regionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerLevel: {
    fontSize: 12,
    color: '#666',
  },
  zoneItem: {
    backgroundColor: 'white',
  },
  zoneName: {
    fontSize: 14,
  },
  zoneStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  allocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  allocationButton: {
    minWidth: 40,
    height: 40,
    padding: 0,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedRegion: {
    backgroundColor: '#f5f5f5',
    marginTop: 4,
    borderRadius: 8,
  },
  lockedText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 8,
  },
  huntingContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  huntButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  huntingCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 