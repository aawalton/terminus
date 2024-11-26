import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ferfjkhyktltrozgsfzi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcmZqa2h5a3RsdHJvemdzZnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NDM0NDEsImV4cCI6MjA0NzUxOTQ0MX0.vEDc6uxKBAhSP1PLciaFDQN71w0ZWSVhN-Rx_bhNZBU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})