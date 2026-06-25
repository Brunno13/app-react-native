import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ animation: 'slide_from_right' }}>
    <Stack.Screen 
        name="login" 
        options={{ headerShown: false }} 
    />
    <Stack.Screen name="signup" options={{ title: 'Criar Conta', headerShown: true }} />
    <Stack.Screen name="forgot-password" options={{ title: 'Recuperação', headerShown: true }} />
    </Stack>
  );
}