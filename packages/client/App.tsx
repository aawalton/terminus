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

import { Stack } from 'expo-router'

export default function App() {
  return <Stack />
}