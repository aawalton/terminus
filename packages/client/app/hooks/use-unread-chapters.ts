import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

interface Chapter {
  id: string
  name: string
}

export function useUnreadChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const { session } = useAuth()

  useEffect(() => {
    async function fetchChapters() {
      if (!session?.user) return

      try {
        // First, get The Wandering Inn activity ID
        const { data: twiActivity } = await supabase
          .schema('status')
          .from('activities')
          .select('id')
          .eq('name', 'The Wandering Inn')
          .is('parent_activity_id', null)
          .single()

        if (!twiActivity) return

        // Get all chapters and their experience records
        const { data: chaptersWithExperience } = await supabase
          .schema('status')
          .from('activities')
          .select(`
            id,
            name,
            experience:experience(id)
          `)
          .eq('parent_activity_id', twiActivity.id)
          .eq('experience.user_id', session.user.id)

        if (!chaptersWithExperience) return

        // Filter out chapters that have experience records
        const unreadChapters = chaptersWithExperience
          .filter(chapter => !chapter.experience?.length)
          .map(({ id, name }) => ({ id, name }))

        setChapters(unreadChapters)
      } catch (error) {
        console.error('Error fetching chapters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [session])

  return { chapters, loading }
} 