import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Environment variables should be configured in a .env file
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Required environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not set')
}

// Create a single supabase client for interacting with your database
const supabase = createClient < Database > (supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default supabase
export type { Database } 