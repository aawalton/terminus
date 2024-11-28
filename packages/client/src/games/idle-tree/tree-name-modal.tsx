import { useState } from 'react'
import { Modal, View, StyleSheet, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'

interface TreeNameModalProps {
  visible: boolean
  onSubmit: (name: string) => Promise<boolean>
}

export function TreeNameModal({ visible, onSubmit }: TreeNameModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your tree')
      return
    }

    if (name.length > 32) {
      Alert.alert('Error', 'Tree name must be 32 characters or less')
      return
    }

    setLoading(true)
    const success = await onSubmit(name.trim())
    if (!success) {
      Alert.alert('Error', 'Failed to save tree name')
    }
    setLoading(false)
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Input
            label="Name Your Demonic Tree"
            placeholder="Enter a name..."
            value={name}
            onChangeText={setName}
            maxLength={32}
            autoFocus
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          <Button
            title={loading ? 'Saving...' : 'Begin Your Journey'}
            onPress={handleSubmit}
            disabled={loading || !name.trim()}
            buttonStyle={styles.button}
            disabledStyle={styles.buttonDisabled}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  inputLabel: {
    color: '#666',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
}) 