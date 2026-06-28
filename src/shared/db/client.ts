import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

// Abre a conexão com o banco SQLite nativo
const expoDb = openDatabaseSync('app_database.db');

// Exporta a instância pronta do Drizzle
export const db = drizzle(expoDb);