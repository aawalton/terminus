import { View, Text, StyleSheet } from 'react-native'
import { useIdleTreeGameState } from './use-idle-tree-game-state'
import { TreeNameModal } from './tree-name-modal'
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
    <View style={styles.container}>
      {gameState.treeName && (
        <Text style={styles.treeName}>{gameState.treeName}</Text>
      )}
      <TreeNameModal
        visible={!gameState.treeName && !loading}
        onSubmit={(name) => saveGame({ ...gameState, treeName: name })}
      />
      <Text>Age: {gameState.ageInDays} days</Text>
      <Text>Cultivation Stage: {gameState.cultivationStage}</Text>
      <Text>Essence: {gameState.currentEssence.toString()} / {gameState.maxEssence.toString()}</Text>
      <Text>Daily Credits: {gameState.dailyCredits}</Text>
      <Text>Current Level: {gameState.currentLevel}</Text>

      {canAdvance && (
        <Button
          title="Advance Cultivation"
          onPress={handleAdvancement}
          buttonStyle={styles.advanceButton}
          containerStyle={styles.advanceButtonContainer}
        />
      )}
    </View>
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
  advanceButtonContainer: {
    marginTop: 20,
  },
  advanceButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
  },
}) 