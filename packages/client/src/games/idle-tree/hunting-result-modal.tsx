import { Modal, View, StyleSheet } from 'react-native';
import { Button, Text } from '@rneui/themed';
import { Creature } from '@terminus/idle-tree';

interface HuntingResultModalProps {
  visible: boolean;
  onClose: () => void;
  creature?: Creature;
  essenceGained?: bigint;
  creditsGained?: number;
  huntingCost?: bigint;
}

export function HuntingResultModal({
  visible,
  onClose,
  creature,
  essenceGained,
  creditsGained,
  huntingCost,
}: HuntingResultModalProps) {
  if (!creature || essenceGained === undefined || creditsGained === undefined || huntingCost === undefined) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Hunt Successful!</Text>
          <Text style={styles.creatureInfo}>
            Defeated {creature.name} (Level {creature.level})
          </Text>
          <Text style={styles.costInfo}>
            Cost: {huntingCost.toString()} essence
          </Text>
          <Text style={styles.rewardInfo}>
            Gained {essenceGained.toString()} essence
          </Text>
          <Text style={styles.rewardInfo}>
            Gained {creditsGained} sacrificial credit{creditsGained === 1 ? '' : 's'}
          </Text>
          <Button
            title="Close"
            onPress={onClose}
            buttonStyle={styles.closeButton}
          />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  creatureInfo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  rewardInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    minWidth: 120,
  },
  costInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#e74c3c',
  },
}); 