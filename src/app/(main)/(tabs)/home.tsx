import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useGlobalAuth } from '@/features/auth';
import { useNotification } from '@/shared/providers/NotificationProvider';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

export default function HomeRoute() {
  const { session } = useGlobalAuth();
  const { t } = useTranslation();
  const { showToast, showModal } = useNotification();
  const { colors } = useAppTheme();
  
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("💥 CRASH DE TESTE PROVOCADO PELO USUÁRIO!");
  }

  const styles = useMemo(() => StyleSheet.create({
    container: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 20, 
      backgroundColor: colors.background 
    },
    title: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      marginBottom: 40,
      color: colors.text
    },
    actionButton: { 
      width: '100%', 
      maxWidth: 300, 
      height: 50, 
      borderRadius: 8, 
      alignItems: 'center', 
      justifyContent: 'center', 
      marginBottom: 16 
    },
    buttonText: { 
      color: colors.surface, 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
    divider: {
      height: 1,
      width: '100%',
      maxWidth: 300,
      backgroundColor: colors.border,
      marginVertical: 20,
    }
  }), [colors]);

  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.title} testID="welcome-text">
        {t('home.welcome')}, {session?.user?.name || t('home.defaultUser')}!
      </Text>
      
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.success }]} 
        onPress={() => showToast(t('home.toastTitle'), t('home.toastMessage'), 'success')}
      >
        <Text style={styles.buttonText}>{t('home.testToast')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.info }]} 
        onPress={() => showModal(t('home.modalTitle'), t('home.modalMessage'), 'info')}
      >
        <Text style={styles.buttonText}>{t('home.testModal')}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: colors.dangerDark }]} 
        onPress={() => setShouldCrash(true)}
      >
        <Text style={styles.buttonText}>{t('home.simulateCrash')}</Text>
      </TouchableOpacity>
    </View>
  );
}