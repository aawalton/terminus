import { Modal, View, StyleSheet } from 'react-native';
import { Button, Input } from '@rneui/themed';
import { useState, useEffect } from 'react';
import type { Database } from '@terminus/supabase';

type Request = Database['status']['Tables']['requests']['Row'];

interface EditRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  request: Request | null;
}

export function EditRequestModal({ visible, onClose, onSubmit, request }: EditRequestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description);
    }
  }, [request]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    await onSubmit(title.trim(), description.trim());
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Input
            label="Title"
            placeholder="Enter request title..."
            value={title}
            onChangeText={setTitle}
            labelStyle={styles.inputLabel}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
          />

          <Input
            label="Description"
            placeholder="Enter request description..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            labelStyle={styles.inputLabel}
            inputStyle={[styles.input, styles.textArea]}
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              buttonStyle={[styles.button, styles.cancelButton]}
            />
            <Button
              title={loading ? 'Saving...' : 'Save'}
              onPress={handleSubmit}
              disabled={loading || !title.trim() || !description.trim()}
              buttonStyle={[styles.button, styles.submitButton]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
}); 