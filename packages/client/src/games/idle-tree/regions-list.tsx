import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem, Divider } from '@rneui/themed';
import { useWorldData } from './use-world-data';

export function RegionsList() {
  const { worldData, loading } = useWorldData();
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});

  if (loading || !worldData) {
    return null;
  }

  const toggleRegion = (regionId: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

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
        {worldData.regions.map((region) => (
          <View key={region.id} style={styles.regionContainer}>
            <ListItem.Accordion
              content={
                <ListItem.Content>
                  <ListItem.Title style={styles.regionTitle}>
                    {region.name}
                  </ListItem.Title>
                  <ListItem.Subtitle style={styles.dangerLevel}>
                    Danger Level: {region.dangerLevel}
                  </ListItem.Subtitle>
                </ListItem.Content>
              }
              isExpanded={expandedRegions[region.id]}
              onPress={() => toggleRegion(region.id)}
              containerStyle={styles.regionAccordion}
            >
              {region.zones.map((zone) => (
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
                      Size: {zone.size} • Density: {zone.density} • Difficulty: {zone.difficulty}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                </ListItem>
              ))}
            </ListItem.Accordion>
          </View>
        ))}
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
  },
  mainAccordion: {
    padding: 0,
    backgroundColor: 'white',
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
}); 