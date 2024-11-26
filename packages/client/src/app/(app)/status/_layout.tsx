import { Stack } from 'expo-router';

export default function StatusLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
      screenListeners={{
        state: (e) => {
          // You can add analytics here if needed
        },
      }}
    >
      <Stack.Screen
        name="the-wandering-inn"
        options={{
          title: "The Wandering Inn",
        }}
      />
    </Stack>
  );
} 