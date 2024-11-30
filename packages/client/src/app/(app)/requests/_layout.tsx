import { Stack } from 'expo-router';

export default function RequestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Requests",
        }}
      />
    </Stack>
  );
} 