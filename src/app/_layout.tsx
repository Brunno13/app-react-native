import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthFlow } from '../features/auth/hooks/useAuth';

export default function RootLayout() {
  const { session, isPending } = useAuthFlow();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(main)/home');
    }
  }, [session, isPending, segments]);

  // Trocamos o <Slot /> pelo <Stack /> com headerShown: false
  // Isso cria o motor nativo, mas esconde o AppBar "global" para
  // deixarmos cada grupo (auth ou main) decidir se quer AppBar ou não.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}