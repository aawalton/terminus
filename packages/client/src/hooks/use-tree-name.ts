import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const GAME_STATE_KEY = '@idle_tree_game_state'

interface TreeGameState {
  treeName: string | null
  currentLevel: number
  maxEssence: string
  currentEssence: string
  essenceRecoveryPerMinute: string
  essenceGainedAt: string // timestamp
  dailyCredits: number
  dailyCreditsGainedAt: string // timestamp
  stateVersion: number
}

const DEFAULT_GAME_STATE: TreeGameState = {
  treeName: null,
  currentLevel: 0,
  maxEssence: '100',
  currentEssence: '10',
  essenceRecoveryPerMinute: '1',
  essenceGainedAt: new Date().toISOString(),
  dailyCredits: 0,
  dailyCreditsGainedAt: new Date().toISOString(),
  stateVersion: 1,
}

export function useTreeName() {
  const [gameState, setGameState] = useState<TreeGameState>(DEFAULT_GAME_STATE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {
    try {
      const savedState = await AsyncStorage.getItem(GAME_STATE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        parsedState.maxEssence = BigInt(parsedState.maxEssence).toString()
        parsedState.currentEssence = BigInt(parsedState.currentEssence).toString()
        parsedState.essenceRecoveryPerMinute = BigInt(parsedState.essenceRecoveryPerMinute).toString()
        setGameState(parsedState)
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
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify({
      ...updatedState,
      maxEssence: updatedState.maxEssence.toString(),
      currentEssence: updatedState.currentEssence.toString(),
      essenceRecoveryPerMinute: updatedState.essenceRecoveryPerMinute.toString(),
    }))
    return true
  }

  return {
    gameState,
    loading,
    saveGame
  }
} 