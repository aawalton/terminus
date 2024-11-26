import { View, Text, StyleSheet } from 'react-native'
import { useIdleTreeGameState } from '../../../hooks/use-idle-tree-game-state'
import { TreeNameModal } from '../../../components/tree-name-modal'
import { useLayoutEffect } from 'react'
import { useNavigation } from 'expo-router'
import { format } from 'date-fns'

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

  console.log(loading, gameState.treeName)
  return (
    <View style={styles.container}>
      {gameState.treeName && (
        <Text style={styles.treeName}>{gameState.treeName}</Text>
      )}
      <TreeNameModal
        visible={!gameState.treeName && !loading}
        onSubmit={(name) => saveGame({ treeName: name })}
      />
      <Text>Current Level: {gameState.currentLevel}</Text>
      <Text>Current Essence: {gameState.currentEssence.toString()}</Text>
      <Text>Max Essence: {gameState.maxEssence.toString()}</Text>
      <Text>Daily Credits: {gameState.dailyCredits}</Text>
      <Text>Essence Gained At: {format(new Date(gameState.essenceGainedAt), 'p')}</Text>
      <Text>Daily Credits Gained At: {format(new Date(gameState.dailyCreditsGainedAt), 'p')}</Text>
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