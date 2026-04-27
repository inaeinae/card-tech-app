import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen name="[id]/index" options={{ title: '이벤트 상세' }} />
    </Stack>
  );
}
