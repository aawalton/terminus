import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useIdleTreeGameState } from './use-idle-tree-game-state'
import { TreeNameModal } from './tree-name-modal'
import { RegionsList } from './regions-list'
import { useLayoutEffect } from 'react'
import { useNavigation } from 'expo-router'
import { Button } from '@rneui/themed'
import { canAdvanceCultivation } from '@terminus/idle-tree'

export default function IdleTree() {
  const { gameState, loading, saveGame } = useIdleTreeGameState()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Idle Tree'
    })
  }, [navigation])

  const handleAdvancement = async () => {
    const nextLevel = gameState.currentLevel + 1
    await saveGame({
      ...gameState,
      currentLevel: nextLevel,
      currentEssence: "0"
    })
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  const canAdvance = canAdvanceCultivation(
    gameState.currentLevel,
    BigInt(gameState.currentEssence)
  )

  return (
    <ScrollView style={styles.container}>
      {gameState.treeName && (
        <Text style={styles.treeName}>{gameState.treeName}</Text>
      )}
      <TreeNameModal
        visible={!gameState.treeName && !loading}
        onSubmit={(name) => saveGame({ ...gameState, treeName: name })}
      />
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Age: {gameState.ageInDays} days</Text>
        <Text style={styles.statText}>Cultivation Stage: {gameState.cultivationStage}</Text>
        <Text style={styles.statText}>
          Essence: {gameState.currentEssence.toString()} / {gameState.maxEssence.toString()}
        </Text>
        <Text style={styles.statText}>
          Total Generation: {gameState.essenceRecoveryPerMinute}/min
        </Text>
        <Text style={styles.statText}>Daily Credits: {gameState.dailyCredits}</Text>
        <Text style={styles.statText}>Current Level: {gameState.currentLevel}</Text>
      </View>

      {canAdvance && (
        <Button
          title="Advance Cultivation"
          onPress={handleAdvancement}
          buttonStyle={styles.advanceButton}
          containerStyle={styles.advanceButtonContainer}
        />
      )}

      {gameState.treeName && <RegionsList />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  treeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statText: {
    fontSize: 16,
    marginVertical: 4,
  },
  advanceButtonContainer: {
    marginTop: 20,
  },
  advanceButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
  },
}) 