import { View, Text, FlatList } from 'react-native';
import { useRequests } from './use-requests';

export default function Requests() {
  const { requests, loading, error } = useRequests();

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
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
} 