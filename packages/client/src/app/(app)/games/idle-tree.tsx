import { View, Text, StyleSheet } from 'react-native'
import { useTreeName } from '../../../hooks/use-tree-name'
import { TreeNameModal } from '../../../components/tree-name-modal'
import { useLayoutEffect } from 'react'
import { useNavigation } from 'expo-router'

export default function IdleTree() {
  const { treeName, loading, saveTreeName } = useTreeName()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Idle Tree'
    })
  }, [navigation])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {treeName && (
        <Text style={styles.treeName}>{treeName}</Text>
      )}
      <TreeNameModal
        visible={!treeName}
        onSubmit={saveTreeName}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  treeName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
}) 