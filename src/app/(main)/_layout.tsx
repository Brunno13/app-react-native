import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="edit-profile" 
        options={{ title: 'Editar Perfil', presentation: 'card' }} 
      />
      
      <Stack.Screen 
        name="security" 
        options={{ title: 'Segurança', presentation: 'card' }} 
      />
    </Stack>
  );
}