import type { Config } from 'drizzle-kit';

export default {
  schema: './src/shared/db/schema/index.ts', // 🔥 Aponta para a nova pasta de schemas
  out: './src/shared/db/migrations',         // 🔥 Aponta para a nova pasta de saída (escondida)
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;