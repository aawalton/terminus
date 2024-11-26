import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TREE_NAME_KEY = '@tree_name'

interface TreeGameState {
  treeName: string | null
  currentLevel: number
  maxEssence: bigint
  currentEssence: bigint
  essenceRecoveryPerMinute: bigint
  essenceGainedAt: string // timestamp
  dailyCredits: number
  dailyCreditsGainedAt: string // timestamp
}

const DEFAULT_GAME_STATE: TreeGameState = {
  treeName: null,
  currentLevel: 0,
  maxEssence: BigInt(100),
  currentEssence: BigInt(10),
  essenceRecoveryPerMinute: BigInt(1),
  essenceGainedAt: new Date().toISOString(),
  dailyCredits: 0,
  dailyCreditsGainedAt: new Date().toISOString(),
}

export function useTreeName() {
  const [gameState, setGameState] = useState<TreeGameState>(DEFAULT_GAME_STATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {
    try {
      const savedState = await AsyncStorage.getItem(TREE_NAME_KEY)
      if (savedState) {
        setGameState(JSON.parse(savedState))
      } else {
        setGameState(DEFAULT_GAME_STATE)
      }
    } catch (error) {
      console.error('Error loading game state:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGame = async (newState: Partial<TreeGameState>) => {
    const updatedState = { ...gameState, ...newState }
    setGameState(updatedState)
    await AsyncStorage.setItem(TREE_NAME_KEY, JSON.stringify(updatedState))
    return true
  }

  return {
    gameState,
    loading,
    saveGame
  }
} 