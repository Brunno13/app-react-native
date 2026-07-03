import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { SecurityForm, usePreferences, type ChangePasswordFormData } from '@/features/profile';
import { useAuth, useGlobalAuth } from '@/features/auth';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';
import { useNotification } from '@/shared/providers/NotificationProvider';

export default function SecurityRoute() {
  const { changePassword, getActiveSessions, revokeDeviceSession, loading } = useAuth();
  const { session } = useGlobalAuth();
  const { preferences, updatePreferences, loading: prefsLoading } = usePreferences(session?.user?.id);
  const { t } = useTranslation();
  const { showToast, showModal } = useNotification();
  const { colors, spacing } = useAppTheme();
  const globalStyles = useGlobalStyles();
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
      showToast(t('alerts.success'), t('security.biometricsActivated'), 'success'); 
    }
  };

  const isBiometricsEnabled = preferences?.isBiometricsEnabled ?? false;

  const styles = useMemo(() => StyleSheet.create({
    section: { marginTop: spacing.md, marginBottom: spacing.lg },
    sessionsTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
    revokeButton: { padding: spacing.sm },
    biometricCard: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: spacing.sm
    },
    biometricInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: spacing.md,
    },
    warningText: {
      fontSize: 12,
      color: colors.danger,
      textAlign: 'center',
      marginBottom: spacing.md,
    }
  }), [colors, spacing]);

  return (
    <ScrollView style={globalStyles.safeArea} contentContainerStyle={globalStyles.scrollContent}>
      <Text style={globalStyles.subtitle}>{t('profile.securityTitle')}</Text>
      
      <View style={styles.section}>
        <SecurityForm onSubmitPasswordChange={handlePasswordChange} loading={loading} />
      </View>

      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>{t('security.biometricsSection')}</Text>
      
      <View style={[globalStyles.card, styles.biometricCard]}>
        <View style={styles.biometricInfo}>
          <FontAwesome name="lock" size={24} color={isBiometricsEnabled ? colors.primary : colors.textSecondary} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>
              {t('security.biometricsTitle')}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              {t('security.biometricsSubtitle')}
            </Text>
          </View>
        </View>

        {checkingHardware || prefsLoading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Switch
            value={isBiometricsEnabled}
            onValueChange={toggleBiometrics}
            disabled={!hasHardware}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        )}
      </View>
      {!hasHardware && !checkingHardware && (
        <Text style={styles.warningText}>
          {t('security.noHardwareWarning')}
        </Text>
      )}

      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>{t('profileScreen.activeSessions')}</Text>
      <Text style={[globalStyles.textSecondary, { marginBottom: spacing.md }]}>
        {t('profileScreen.manageDevices')}
      </Text>

      {loadingSessions ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        sessions.map((sess) => (
          <View key={sess.token} style={globalStyles.card}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name={sess.userAgent?.includes('Mobile') ? 'mobile' : 'desktop'} size={20} color={colors.textSecondary} style={{ marginRight: 15 }} />
              <View>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>
                  {sess.userAgent || t('profileScreen.unknownDevice')}
                </Text>
                <Text style={globalStyles.textSecondary}>
                  {new Date(sess.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRevoke(sess.token)} style={styles.revokeButton}>
              <FontAwesome name="trash" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}