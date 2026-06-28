import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

const expoDb = openDatabaseSync('app_database.db');

export const db = drizzle(expoDb);