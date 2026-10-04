import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react';
import {
  View,
} from 'react-native';
import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from 'react-error-boundary';

import '../shared/config/i18n';
import { ErrorFallback } from '../shared/ui/ErrorFallback';
import { useGlobalAuth } from '@/features/auth';
import { AppProvider } from './_providers/_AppProvider';
import { STORYBOOK_ENABLED } from '../shared/config/storybook.config';

void SplashScreen.preventAutoHideAsync();

const StorybookUIRoot = STORYBOOK_ENABLED
  ? lazy(() => import('../../.rnstorybook'))
  : null;

function AppNavigation() {
  const { session, isPending } = useGlobalAuth();

  const segments = useSegments();
  const router = useRouter();

  const [rootLayoutReady, setRootLayoutReady] =
    useState(false);

  const inAuthGroup =
    segments[0] === '(auth)';

  const inMainGroup =
    segments[0] === '(main)';

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }

      return;
    }

    if (!inMainGroup) {
      router.replace('/(main)/(tabs)/home');
    }
  }, [
    session,
    isPending,
    inAuthGroup,
    inMainGroup,
    router,
  ]);

  const navigationReady =
    !isPending &&
    (
      (!session && inAuthGroup) ||
      (session && inMainGroup)
    );

  useEffect(() => {
    if (
      !navigationReady ||
      !rootLayoutReady
    ) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [
    navigationReady,
    rootLayoutReady,
  ]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
      }}
      onLayout={() => {
        setRootLayoutReady(true);
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (STORYBOOK_ENABLED) {
      void SplashScreen.hideAsync();
    }
  }, []);

  if (
    STORYBOOK_ENABLED &&
    StorybookUIRoot
  ) {
    return (
      <Suspense fallback={null}>
        <StorybookUIRoot />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
    >
      <AppProvider>
        <AppNavigation />
      </AppProvider>
    </ErrorBoundary>
  );
}
