import { View, FlatList } from 'react-native';
import { useRequests } from './use-requests';
import { Button, ListItem, Text } from '@rneui/themed';
import { useState } from 'react';
import { CreateRequestModal } from './create-request-modal';

export default function Requests() {
  const { requests, loading, error, createRequest } = useRequests();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<{ [key: string]: boolean }>({});

  const handleCreateRequest = async (title: string, description: string) => {
    try {
      await createRequest(title, description);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const toggleRequest = (requestId: string) => {
    setExpandedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error loading requests</Text>
        </View>
      );
    }

    if (!requests?.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No requests found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem.Accordion
            content={
              <ListItem.Content>
                <ListItem.Title style={styles.requestTitle}>
                  {item.title}
                </ListItem.Title>
              </ListItem.Content>
            }
            isExpanded={expandedRequests[item.id]}
            onPress={() => toggleRequest(item.id)}
            containerStyle={styles.requestAccordion}
          >
            <ListItem containerStyle={styles.requestDetails}>
              <ListItem.Content>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.metadata}>
                  <Text style={styles.metadataText}>
                    Requested at: {new Date(item.requested_at || '').toLocaleDateString()}
                  </Text>
                  {item.completed_at && (
                    <Text style={styles.metadataText}>
                      Completed at: {new Date(item.completed_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </ListItem.Content>
            </ListItem>
          </ListItem.Accordion>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Create Request"
          onPress={() => setIsModalVisible(true)}
          buttonStyle={styles.createButton}
        />
      </View>

      <CreateRequestModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateRequest}
      />

      {renderContent()}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  requestAccordion: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  requestDetails: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  metadata: {
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}; 