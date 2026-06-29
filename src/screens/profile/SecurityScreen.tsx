import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { SecurityForm } from '@/features/profile/ui/SecurityForm';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import type { ChangePasswordFormData } from '@/features/profile/validations/profileSchema';
import { globalStyles } from '@/shared/ui/globalStyles';
import { theme } from '@/shared/ui/theme';
import { useNotification } from '@/shared/providers/NotificationProvider';

export const SecurityScreen = () => {
  const { changePassword, getActiveSessions, revokeDeviceSession, loading } = useAuth();
  const { session } = useGlobalAuth();
  const { preferences, updatePreferences, loading: prefsLoading } = usePreferences(session?.user?.id);
  
  const { t } = useTranslation();
  const { showToast, showModal } = useNotification();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const [hasHardware, setHasHardware] = useState(false);
  const [checkingHardware, setCheckingHardware] = useState(true);

  useEffect(() => {
    fetchSessions();
    checkBiometricHardware();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data } = await getActiveSessions();
    if (data) setSessions(data);
    setLoadingSessions(false);
  };

  const checkBiometricHardware = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasHardware(compatible && enrolled);
    } catch (error) {
      console.error('Erro ao verificar hardware biométrico:', error);
    } finally {
      setCheckingHardware(false);
    }
  };

  const handlePasswordChange = async (data: ChangePasswordFormData): Promise<boolean> => {
    const { error } = await changePassword(data.newPassword, data.currentPassword);
    
    if (error) {
      showModal(t('alerts.error'), error.message || t('alerts.error'), 'error');
      return false;
    } 
    
    showModal(t('alerts.success'), t('alerts.passwordChanged'), 'success');
    fetchSessions();
    return true; 
  };

  const handleRevoke = async (token: string) => {
    const { error } = await revokeDeviceSession(token);
    if (error) {
      showToast(t('alerts.error'), t('alerts.revokeError'), 'error');
    } else {
      fetchSessions();
    }
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value && !hasHardware) {
      showToast(t('alerts.warning'), t('security.biometricsNotSetup'), 'info');
      return;
    }

    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('security.biometricsConfirm'),
        fallbackLabel: t('common.cancel'),
        disableDeviceFallback: true, 
      });

      if (!result.success) {
        return; 
      }
    }

    await updatePreferences({ isBiometricsEnabled: value });
    
    if (value) {
      showToast(t('alerts.success'), t('security.biometricsActivated'), 'success'); // 🔥 Traduzido
    }
  };

  const isBiometricsEnabled = preferences?.isBiometricsEnabled ?? false;

  return (
    <ScrollView style={globalStyles.safeArea} contentContainerStyle={globalStyles.scrollContent}>
      <Text style={globalStyles.subtitle}>{t('profile.securityTitle')}</Text>
      
      <View style={styles.section}>
        <SecurityForm onSubmitPasswordChange={handlePasswordChange} loading={loading} />
      </View>

      {/* 🔥 Título Traduzido */}
      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>{t('security.biometricsSection')}</Text>
      
      <View style={[globalStyles.card, styles.biometricCard]}>
        <View style={styles.biometricInfo}>
          <FontAwesome name="lock" size={24} color={isBiometricsEnabled ? theme.colors.primary : theme.colors.textSecondary} />
          <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
              {t('security.biometricsTitle')}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>
              {t('security.biometricsSubtitle')}
            </Text>
          </View>
        </View>

        {checkingHardware || prefsLoading ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <Switch
            value={isBiometricsEnabled}
            onValueChange={toggleBiometrics}
            disabled={!hasHardware}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          />
        )}
      </View>
      {!hasHardware && !checkingHardware && (
        <Text style={styles.warningText}>
          {t('security.noHardwareWarning')}
        </Text>
      )}

      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>{t('profileScreen.activeSessions')}</Text>
      <Text style={[globalStyles.textSecondary, { marginBottom: theme.spacing.md }]}>
        {t('profileScreen.manageDevices')}
      </Text>

      {loadingSessions ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        sessions.map((sess) => (
          <View key={sess.token} style={globalStyles.card}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name={sess.userAgent?.includes('Mobile') ? 'mobile' : 'desktop'} size={20} color={theme.colors.textSecondary} style={{ marginRight: 15 }} />
              <View>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                  {sess.userAgent || t('profileScreen.unknownDevice')}
                </Text>
                <Text style={globalStyles.textSecondary}>
                  {new Date(sess.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRevoke(sess.token)} style={styles.revokeButton}>
              <FontAwesome name="trash" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  sessionsTitle: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  revokeButton: { padding: theme.spacing.sm },
  biometricCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  biometricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  }
});