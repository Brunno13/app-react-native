import React, { createContext, useContext, ReactNode } from 'react';
import { View, ActivityIndicator, Text, useColorScheme } from 'react-native';
import { type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useTranslation } from 'react-i18next';

// 🔥 Importamos as paletas puras em vez do objeto estático "theme"
import { lightColors, darkColors } from '@/shared/ui/theme';
import { db } from '@/shared/db/client'; 
import migrations from '@/shared/db/migrations/migrations'; 

interface DatabaseContextData {
  db: ExpoSQLiteDatabase;
}

const DatabaseContext = createContext<DatabaseContextData>({ db });

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const { success, error } = useMigrations(db, migrations);
  const { t } = useTranslation();
  
  // 🔥 Lemos o tema nativo do celular apenas para esta tela de boot
  const systemTheme = useColorScheme();
  const colors = systemTheme === 'dark' ? darkColors : lightColors;

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background }}>
        <Text style={{ color: colors.danger, fontWeight: 'bold' }}>
          {t('database.criticalError')}
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>
          {error.message}
        </Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>
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