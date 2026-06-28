import type { Config } from 'drizzle-kit';

export default {
  schema: './src/shared/db/schema/index.ts',
  out: './src/shared/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;