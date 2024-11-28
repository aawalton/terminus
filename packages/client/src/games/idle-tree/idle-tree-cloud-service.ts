import { supabase } from '../../lib/supabase'
import { CurrentTreeGameState, TreeGameState } from '@terminus/idle-tree'

export class IdleTreeCloudService {
  private static GAME_ID = 'idle-tree'

  static async loadCloudSave(): Promise<CurrentTreeGameState | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .schema('status')
      .from('cloud_saves')
      .select('*')
      .eq('game_id', this.GAME_ID)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !data) return null
    return data.state as CurrentTreeGameState
  }

  static async saveGameState(state: CurrentTreeGameState): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .schema('status')
      .from('cloud_saves')
      .upsert({
        game_id: this.GAME_ID,
        user_id: user.id,
        state,
        state_version: state.stateVersion,
        updated_at: new Date().toISOString()
      })

    return !error
  }
} 