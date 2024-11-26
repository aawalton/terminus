import { View, Text, StyleSheet } from 'react-native'
import { useIdleTreeGameState } from '../../../hooks/use-idle-tree-game-state'
import { TreeNameModal } from '../../../components/tree-name-modal'
import { useLayoutEffect } from 'react'
import { useNavigation } from 'expo-router'

export default function IdleTree() {
  const { gameState, loading, saveGame } = useIdleTreeGameState()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Idle Tree'
    })
  }, [navigation])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  // Calculate age in days
  const createdAt = new Date(gameState.createdAt)
  const now = new Date()
  const hoursPassed = Math.floor((now.getTime() - createdAt.getTime()) / 3600000)
  const ageInDays = hoursPassed

  console.log(loading, gameState.treeName)
  return (
    <View style={styles.container}>
      {gameState.treeName && (
        <Text style={styles.treeName}>{gameState.treeName}</Text>
      )}
      <TreeNameModal
        visible={!gameState.treeName && !loading}
        onSubmit={(name) => saveGame({ ...gameState, treeName: name })}
      />
      <Text>Age: {ageInDays} days</Text>
      <Text>Current Level: {gameState.currentLevel}</Text>
      <Text>Essence: {gameState.currentEssence.toString()} / {gameState.maxEssence.toString()}</Text>
      <Text>Daily Credits: {gameState.dailyCredits}</Text>
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
}) 