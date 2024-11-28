import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem, Button, Text } from '@rneui/themed';
import { useWorldData } from './use-world-data';
import { useIdleTree } from './idle-tree-context';
import { calculateZoneExploration, calculateZoneEssenceGeneration, calculateFinalHuntingCost } from '@terminus/idle-tree';
import { Icon } from '@rneui/themed';
import { HuntingResultModal } from './hunting-result-modal';

export function RegionsList() {
  const { worldData, loading } = useWorldData();
  const { gameState, updateAllocation, hunt } = useIdleTree();
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});
  const [huntingResult, setHuntingResult] = useState<{
    visible: boolean;
    creature?: any;
    essenceGained?: bigint;
    creditsGained?: number;
  }>({ visible: false });

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

  const handleHunt = async (zone: any) => {
    try {
      const result = await hunt(zone);
      setHuntingResult({
        visible: true,
        creature: result.creature,
        essenceGained: result.essenceGained,
        creditsGained: result.creditsGained,
      });
    } catch (error) {
      console.error('Error during hunting:', error);
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
        creature={huntingResult.creature}
        essenceGained={huntingResult.essenceGained!}
        creditsGained={huntingResult.creditsGained!}
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

                const huntingCost = calculateFinalHuntingCost(
                  BigInt(gameState.zoneHuntingCosts[zone.id] || '0'),
                  exploration / 100
                );
                const canHunt = hasRoots && BigInt(gameState.currentEssence) >= huntingCost;

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
                      <View style={styles.allocationContainer}>
                        <Button
                          title="-"
                          disabled={currentAllocation <= 0}
                          onPress={() => handleAllocationChange(zone.id, -1)}
                          buttonStyle={styles.allocationButton}
                        />
                        <ListItem.Subtitle style={styles.allocationText}>
                          Allocated: {currentAllocation.toString()}/min
                        </ListItem.Subtitle>
                        <Button
                          title="+"
                          disabled={!canIncreaseAllocation}
                          onPress={() => handleAllocationChange(zone.id, 1)}
                          buttonStyle={styles.allocationButton}
                        />
                      </View>
                      {hasRoots && (
                        <View style={styles.huntingContainer}>
                          <Button
                            title="Hunt"
                            disabled={!canHunt}
                            onPress={() => handleHunt(zone)}
                            buttonStyle={styles.huntButton}
                          />
                          <Text style={styles.huntingCost}>
                            Cost: {huntingCost.toString()} essence
                          </Text>
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
    marginTop: 8,
  },
  allocationButton: {
    minWidth: 40,
    paddingHorizontal: 8,
    marginHorizontal: 8,
  },
  allocationText: {
    flex: 1,
    textAlign: 'center',
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
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingHorizontal: 24,
    marginBottom: 4,
  },
  huntingCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 