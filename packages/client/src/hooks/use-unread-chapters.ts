import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './use-auth'

interface Chapter {
  id: string
  name: string
}

export interface Stats {
  totalChapters: number
  completedChapters: number
  totalWordsRead: number
}

export interface UnreadChaptersData {
  chapters: Chapter[]
  stats: Stats
  loading: boolean
}

export function useUnreadChapters(): UnreadChaptersData {
  const [data, setData] = useState<UnreadChaptersData>({
    chapters: [],
    stats: {
      totalChapters: 0,
      completedChapters: 0,
      totalWordsRead: 0
    },
    loading: true
  })
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
            length,
            experience:experience(id)
          `)
          .eq('parent_activity_id', twiActivity.id)
          .eq('experience.user_id', session.user.id)

        if (!chaptersWithExperience) return

        // Calculate stats and filter unread chapters
        const unreadChapters: Chapter[] = []
        let completedCount = 0
        let totalWordsRead = 0

        chaptersWithExperience.forEach(chapter => {
          if (chapter.experience?.length) {
            completedCount++
            totalWordsRead += chapter.length || 0
          } else {
            unreadChapters.push({
              id: chapter.id,
              name: chapter.name
            })
          }
        })

        setData({
          chapters: unreadChapters,
          stats: {
            totalChapters: chaptersWithExperience.length,
            completedChapters: completedCount,
            totalWordsRead
          },
          loading: false
        })
      } catch (error) {
        console.error('Error fetching chapters:', error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchChapters()
  }, [session])

  return data
} 