import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useUnreadChapters } from '../../hooks/use-unread-chapters'
import { useCompleteChapter } from '../../hooks/use-complete-chapter'
import { useState } from 'react'

export default function TheWanderingInn() {
  const { chapters, loading: loadingChapters } = useUnreadChapters()
  const { completeChapter, loading: completing } = useCompleteChapter()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const handleComplete = async (chapterId: string) => {
    const success = await completeChapter(chapterId)
    if (success) {
      setCompletedIds(prev => new Set([...prev, chapterId]))
    }
  }

  const displayedChapters = chapters.filter(chapter => !completedIds.has(chapter.id))

  if (loadingChapters) {
    return (
      <View style={styles.container}>
        <Text>Loading chapters...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedChapters}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.chapterRow}>
            <Text style={styles.chapterName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleComplete(item.id)}
              disabled={completing}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No unread chapters</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chapterName: {
    flex: 1,
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#666',
  },
}) 