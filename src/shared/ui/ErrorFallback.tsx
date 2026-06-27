import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { FallbackProps } from 'react-error-boundary';
import { globalStyles } from './globalStyles';
import { theme } from './theme';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation();

  if (__DEV__) {
    console.error('🚨 [Catastrophic Error Captured]:', error);
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome name="exclamation-triangle" size={50} color={theme.colors.danger} />
          </View>
          
          <Text style={[globalStyles.title, styles.titleLeft]}>
            {t('errors.catastrophicTitle')}
          </Text>
          
          <Text style={[globalStyles.textSecondary, styles.subtitle]}>
            {t('errors.catastrophicSubtitle')}
          </Text>
        </View>

        <TouchableOpacity style={globalStyles.buttonPrimary} onPress={resetErrorBoundary}>
          <Text style={globalStyles.buttonText}>
            {t('errors.buttonTryAgain')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    backgroundColor: `${theme.colors.danger}15`,
    padding: theme.spacing.lg,
    borderRadius: 50,
  },
  titleLeft: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
});