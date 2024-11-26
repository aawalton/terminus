import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TREE_NAME_KEY = '@tree_name'

export function useTreeName() {
  const [treeName, setTreeName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTreeName()
  }, [])

  const loadTreeName = async () => {
    try {
      const name = await AsyncStorage.getItem(TREE_NAME_KEY)
      setTreeName(name)
    } catch (error) {
      console.error('Error loading tree name:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTreeName = async (name: string) => {
    try {
      await AsyncStorage.setItem(TREE_NAME_KEY, name)
      setTreeName(name)
      return true
    } catch (error) {
      console.error('Error saving tree name:', error)
      return false
    }
  }

  return {
    treeName,
    loading,
    saveTreeName
  }
} 