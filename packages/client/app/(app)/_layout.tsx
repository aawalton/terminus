import { Drawer } from 'expo-router/drawer';
import { FontAwesome } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="status"
        options={{
          drawerLabel: 'Status',
          title: 'Status',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <FontAwesome name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="games"
        options={{
          drawerLabel: 'Games',
          title: 'Games',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <FontAwesome name="gamepad" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="requests"
        options={{
          drawerLabel: 'Requests',
          title: 'Requests',
          drawerIcon: ({ size, color }: { size: number; color: string }) => (
            <FontAwesome name="list" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
} 