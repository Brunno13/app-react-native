import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { FallbackProps } from 'react-error-boundary';
import { lightColors, darkColors, spacing, borderRadius } from '@/shared/ui/theme'; 

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation();
  const systemTheme = useColorScheme();
  const colors = systemTheme === 'dark' ? darkColors : lightColors;

  if (__DEV__) {
    console.error('🚨 [Catastrophic Error Captured]:', error);
  }

  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: spacing.xl,
      justifyContent: 'space-between',
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: spacing.xl,
      backgroundColor: `${colors.danger}15`,
      padding: spacing.lg,
      borderRadius: 50,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.md,
    },
    buttonPrimary: {
      width: '100%',
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  }), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome name="exclamation-triangle" size={50} color={colors.danger} />
          </View>
          
          <Text style={styles.title}>
            {t('errors.catastrophicTitle')}
          </Text>
          
          <Text style={styles.subtitle}>
            {t('errors.catastrophicSubtitle')}
          </Text>
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={resetErrorBoundary}>
          <Text style={styles.buttonText}>
            {t('errors.buttonTryAgain')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};