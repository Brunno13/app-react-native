import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '@/shared/config/env';

export const authClient =
  createAuthClient({
    baseURL: ENV.API_URL,
    plugins: [
      expoClient({
        scheme: ENV.APP_SCHEME,
        storage: SecureStore,
      }),
    ],
    fetchOptions: {
      headers: {
        Origin: ENV.API_URL,
      },
    },
  });
