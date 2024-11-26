import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

export function useCompleteChapter() {
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()

  const completeChapter = async (chapterId: string) => {
    if (!session?.user) return

    try {
      setLoading(true)

      // Get the skill_id from the activity
      const { data: activity } = await supabase
        .schema('status')
        .from('activities')
        .select('skill_id, length')
        .eq('id', chapterId)
        .single()

      if (!activity) throw new Error('Chapter not found')

      // Create experience record
      const { error } = await supabase
        .schema('status')
        .from('experience')
        .insert({
          activity_id: chapterId,
          skill_id: activity.skill_id,
          user_id: session.user.id,
          amount: activity.length || 0
        })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error completing chapter:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { completeChapter, loading }
} 