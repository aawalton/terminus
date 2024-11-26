import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { AppState } from 'react-native'

// Register auto-refresh for Supabase auth
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

// Import and use expo-router's entry point
import { ExpoRoot } from 'expo-router'

export default function App() {
  const context = {}; // Initialize your context as needed
  return <ExpoRoot context={context} />
}