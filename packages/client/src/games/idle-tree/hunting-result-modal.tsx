import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from '@rneui/themed';
import { CreatureSummary } from '@terminus/idle-tree';

interface HuntingResultModalProps {
  visible: boolean;
  onClose: () => void;
  creatureSummaries?: CreatureSummary[];
  totalEssenceGained?: bigint;
  totalCreditsGained?: number;
  totalHuntingCost?: bigint;
}

export function HuntingResultModal({
  visible,
  onClose,
  creatureSummaries,
  totalEssenceGained,
  totalCreditsGained,
  totalHuntingCost,
}: HuntingResultModalProps) {
  if (!creatureSummaries || totalEssenceGained === undefined ||
    totalCreditsGained === undefined || totalHuntingCost === undefined) {
    return null;
  }

  const netEssence = totalEssenceGained - totalHuntingCost;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Hunt Successful!</Text>

            <Text style={styles.sectionTitle}>Creatures Defeated:</Text>
            {creatureSummaries.map((summary, index) => (
              <Text key={index} style={styles.contentText}>
                {summary.name} (Level {summary.level}) x{summary.count}
              </Text>
            ))}

            <Text style={[styles.contentText, styles.costText]}>
              Total Cost: {totalHuntingCost.toString()} essence
            </Text>
            <Text style={styles.contentText}>
              Total Essence Gained: {totalEssenceGained.toString()} essence
            </Text>
            <Text style={[styles.contentText, styles.netGainText]}>
              Net Gain: {netEssence.toString()} essence
            </Text>
            <Text style={styles.contentText}>
              Total Credits Gained: {totalCreditsGained} sacrificial credit
              {totalCreditsGained === 1 ? '' : 's'}
            </Text>
          </ScrollView>

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
    maxHeight: '80%',
  },
  scrollView: {
    flexGrow: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 8,
  },
  costText: {
    color: '#e74c3c',
    marginTop: 8,
  },
  netGainText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    minWidth: 120,
  },
}); 