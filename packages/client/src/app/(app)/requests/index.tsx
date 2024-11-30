import { View, FlatList } from 'react-native';
import { useRequests } from './use-requests';
import { Button, ListItem, Text } from '@rneui/themed';
import { useState } from 'react';
import { CreateRequestModal } from './create-request-modal';
import { EditRequestModal } from './edit-request-modal';
import type { Database } from '@terminus/supabase';

type Request = Database['status']['Tables']['requests']['Row'];

export default function Requests() {
  const { requests, loading, error, createRequest, editRequest, isRequestOwner } = useRequests();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<{ [key: string]: boolean }>({});
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleCreateRequest = async (title: string, description: string) => {
    try {
      await createRequest(title, description);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleEditRequest = async (title: string, description: string) => {
    try {
      if (!selectedRequest) return;
      await editRequest(selectedRequest.id, title, description);
      setEditModalVisible(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to edit request:', error);
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
                  <View style={styles.metadataContainer}>
                    <View style={styles.timestampsContainer}>
                      <Text style={styles.metadataText}>
                        Requested at: {new Date(item.requested_at || '').toLocaleDateString()}
                      </Text>
                      {item.edited_at && item.edited_at !== item.requested_at && (
                        <Text style={styles.metadataText}>
                          Edited at: {new Date(item.edited_at).toLocaleDateString()}
                        </Text>
                      )}
                      {item.completed_at && (
                        <Text style={styles.metadataText}>
                          Completed at: {new Date(item.completed_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    {isRequestOwner(item.requested_by) && (
                      <Button
                        title="Edit"
                        onPress={() => {
                          setSelectedRequest(item);
                          setEditModalVisible(true);
                        }}
                        buttonStyle={styles.editButton}
                      />
                    )}
                  </View>
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
          onPress={() => setCreateModalVisible(true)}
          buttonStyle={styles.createButton}
        />
      </View>

      <CreateRequestModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateRequest}
      />

      <EditRequestModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleEditRequest}
        request={selectedRequest}
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
    width: '100%' as const,
    marginTop: 8,
  },
  metadataContainer: {
    width: '100%' as const,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
  },
  timestampsContainer: {
    flex: 1,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 60,
    height: 28,
    marginLeft: 16,
  },
}; 