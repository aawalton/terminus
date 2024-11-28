import { supabase } from '../../lib/supabase'
import { CurrentTreeGameState, TreeGameState } from '@terminus/idle-tree'

export class IdleTreeCloudService {
  private static GAME_ID = 'idle-tree'

  static async loadCloudSave(): Promise<CurrentTreeGameState | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found when loading cloud save')
        return null
      }

      const { data, error } = await supabase
        .schema('status')
        .from('cloud_saves')
        .select('*')
        .eq('game_id', this.GAME_ID)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('Error loading cloud save:', error)
        return null
      }

      if (!data) {
        console.log('No cloud save found for user')
        return null
      }

      return data.state as CurrentTreeGameState
    } catch (error) {
      console.error('Unexpected error in loadCloudSave:', error)
      return null
    }
  }

  static async saveGameState(state: CurrentTreeGameState): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found when saving game state')
        return false
      }

      const { error } = await supabase
        .schema('status')
        .from('cloud_saves')
        .upsert({
          game_id: this.GAME_ID,
          user_id: user.id,
          state,
          state_version: state.stateVersion,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'game_id,user_id'
        })

      if (error) {
        console.error('Error saving game state:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error in saveGameState:', error)
      return false
    }
  }
} 