import { z } from 'zod';

const currentEnv = process.env.EXPO_PUBLIC_APP_ENV || 'staging';

const URLS = {
  production: 'https://api-bun.brunnoserver.duckdns.org',
  staging: 'http://api-bun-staging.brunnoserver.duckdns.org',
};

const envSchema = z.object({
  API_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse({
  API_URL: process.env.EXPO_PUBLIC_API_URL || URLS[currentEnv as keyof typeof URLS],
});

if (!parsedEnv.success) {
  console.error('❌ Erro de configuração nas variáveis de ambiente:', parsedEnv.error.format());
  throw new Error('Variáveis de ambiente inválidas.');
}

export const ENV = parsedEnv.data;

export const API_ENDPOINTS = {
  UPLOAD_AVATAR: '/api/avatar',
  GET_AVATAR: (filename: string) => `/api/avatar/${filename}`,
} as const;