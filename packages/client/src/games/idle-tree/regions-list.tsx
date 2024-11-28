import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem, Button } from '@rneui/themed';
import { useWorldData } from './use-world-data';
import { useIdleTree } from './idle-tree-context';
import { calculateZoneExploration, calculateZoneEssenceGeneration } from '@terminus/idle-tree';
import { Icon } from '@rneui/themed';

export function RegionsList() {
  const { worldData, loading } = useWorldData();
  const { gameState, updateAllocation } = useIdleTree();
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});

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

  const canIncreaseAllocation = BigInt(gameState.netGeneration) > 0;

  const accessibleRegions = worldData.regions.filter(
    region => region.dangerLevel <= gameState.currentLevel
  );

  const hasLockedRegions = accessibleRegions.length < worldData.regions.length;

  return (
    <View style={styles.container}>
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
                const isFullySaturated = exploration >= 100;

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
                      {!isFullySaturated && (
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
}); 