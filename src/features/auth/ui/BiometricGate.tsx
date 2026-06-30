import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

interface BiometricGateProps {
  children: React.ReactNode;
  isBiometricsEnabled: boolean; 
  loading: boolean;             
}

export const BiometricGate = ({ children, isBiometricsEnabled, loading }: BiometricGateProps) => {
  const { t } = useTranslation();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colors } = useAppTheme();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    if (!isBiometricsEnabled) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, [isBiometricsEnabled]);

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('security.lockScreenPrompt'),
        fallbackLabel: 'Usar Senha do Dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error('Erro na biometria:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (loading || isUnlocked || !isBiometricsEnabled) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    handleBiometricAuth();
  }, [loading, isUnlocked, isBiometricsEnabled]);

  const styles = useMemo(() => StyleSheet.create({
    lockContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: colors.background,
      padding: 20 
    },
    lockTitle: { fontSize: 60 },
    unlockButton: { marginTop: 40, width: '100%', maxWidth: 300 }
  }), [colors]);

  if (!isUnlocked && isBiometricsEnabled) {
    return (
      <Animated.View style={[styles.lockContainer, { opacity: fadeAnim }]}>
        <Text style={styles.lockTitle}>🔒</Text> 
        <Text style={[globalStyles.title, { color: colors.text, marginTop: 20 }]}>
          {t('security.lockScreenPrompt')}
        </Text>
        
        <TouchableOpacity 
          style={[globalStyles.buttonPrimary, styles.unlockButton]} 
          onPress={handleBiometricAuth}
        >
          <Text style={globalStyles.buttonText}>{t('security.unlockButton')}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <>{children}</>;
};