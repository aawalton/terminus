import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import Collapsible from 'react-native-collapsible';
import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [gamesExpanded, setGamesExpanded] = useState(false);
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props}>
      {/* Home */}
      <DrawerItem
        label="Home"
        icon={({ color, size }) => (
          <MaterialIcons name="home" size={size} color={color} />
        )}
        onPress={() => router.push('/')}
      />

      {/* Status Section */}
      <TouchableOpacity
        onPress={() => setStatusExpanded(!statusExpanded)}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
      >
        <MaterialIcons name="dashboard" size={24} color="#666" />
        <Text style={{ marginLeft: 32 }}>Status</Text>
        <MaterialIcons
          name={statusExpanded ? 'expand-less' : 'expand-more'}
          size={24}
          color="#666"
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      <Collapsible collapsed={!statusExpanded}>
        <View style={{ paddingLeft: 16 }}>
          <DrawerItem
            label="The Wandering Inn"
            onPress={() => router.push('/status/the-wandering-inn')}
          />
        </View>
      </Collapsible>

      {/* Games Section */}
      <TouchableOpacity
        onPress={() => setGamesExpanded(!gamesExpanded)}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
      >
        <MaterialIcons name="games" size={24} color="#666" />
        <Text style={{ marginLeft: 32 }}>Games</Text>
        <MaterialIcons
          name={gamesExpanded ? 'expand-less' : 'expand-more'}
          size={24}
          color="#666"
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      <Collapsible collapsed={!gamesExpanded}>
        <View style={{ paddingLeft: 16 }}>
          <DrawerItem
            label="Idle Tree"
            onPress={() => router.push('/games/idle-tree')}
          />
        </View>
      </Collapsible>

      {/* Requests */}
      <DrawerItem
        label="Requests"
        icon={({ color, size }) => (
          <MaterialIcons name="list" size={size} color={color} />
        )}
        onPress={() => router.push('/requests')}
      />

      {/* Profile */}
      <DrawerItem
        label="Profile"
        icon={({ color, size }) => (
          <MaterialIcons name="person" size={size} color={color} />
        )}
        onPress={() => router.push('/profile')}
      />
    </DrawerContentScrollView>
  );
}

export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
      }}
    />
  );
} 