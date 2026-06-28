import React, { createContext, useContext, ReactNode } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useTranslation } from 'react-i18next';

import { theme } from '@/shared/ui/theme';
import { db } from '@/shared/db/client'; 
import migrations from '@/shared/db/migrations/migrations'; 

interface DatabaseContextData {
  db: ExpoSQLiteDatabase;
}

const DatabaseContext = createContext<DatabaseContextData>({ db });

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { success, error } = useMigrations(db, migrations);
  const { t } = useTranslation();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: theme.colors.danger, fontWeight: 'bold' }}>
          {t('database.criticalError')}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.textSecondary }}>
          {t('database.optimizing')}
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);