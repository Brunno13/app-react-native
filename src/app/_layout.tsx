import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ErrorBoundary } from 'react-error-boundary';

import '../shared/config/i18n'; 
import { ErrorFallback } from '../shared/ui/ErrorFallback';
import { useGlobalAuth } from '@/features/auth';
import { AppProvider } from './_providers/_AppProvider'; 
import { STORYBOOK_ENABLED } from '../shared/config/storybook.config';

const StorybookUIRoot = STORYBOOK_ENABLED 
  ? require('../../.rnstorybook').default 
  : null;

function AppNavigation() {
  const { session, isPending } = useGlobalAuth(); 
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAtRoot = !segments[0]; 

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (isAtRoot || inAuthGroup) {
        router.replace('/(main)/(tabs)/home');
      }
    }
  }, [session, isPending, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  if (STORYBOOK_ENABLED && StorybookUIRoot) {
    return <StorybookUIRoot />;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AppProvider>
        <AppNavigation />
      </AppProvider>
    </ErrorBoundary>
  );
}