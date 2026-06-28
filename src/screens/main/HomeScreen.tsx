import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next'; // 🔥
import { useAuthFlow } from '../../features/auth/hooks/useAuth';

export const HomeScreen = () => {
  const { session } = useAuthFlow();
  const { t } = useTranslation(); // 🔥
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("💥 CRASH DE TESTE PROVOCADO PELO USUÁRIO!");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('home.welcome')}, {session?.user?.name || t('home.defaultUser')}!
      </Text>
      
      <TouchableOpacity 
        style={styles.crashButton} 
        onPress={() => setShouldCrash(true)}
      >
        <Text style={styles.buttonText}>{t('home.simulateCrash')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 40 },
  crashButton: { width: '100%', maxWidth: 300, height: 50, backgroundColor: '#8b0000', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});