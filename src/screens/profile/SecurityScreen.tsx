import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { SecurityForm } from '../../features/profile/ui/SecurityForm';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { ChangePasswordFormData } from '../../features/profile/validations/profileSchema';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';

export const SecurityScreen = () => {
  const { changePassword, getActiveSessions, revokeDeviceSession, loading } = useAuth();
  const { t } = useTranslation();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data } = await getActiveSessions();
    if (data) setSessions(data);
    setLoadingSessions(false);
  };

  const handlePasswordChange = async (data: ChangePasswordFormData): Promise<boolean> => {
    const { error } = await changePassword(data.newPassword, data.currentPassword);
    
    if (error) {
      Alert.alert(t('alerts.error'), error.message || t('alerts.error'));
      return false;
    } 
    
    Alert.alert(t('alerts.success'), t('alerts.passwordChanged'));
    fetchSessions();
    return true; 
  };

  const handleRevoke = async (token: string) => {
    const { error } = await revokeDeviceSession(token);
    if (error) {
      Alert.alert(t('alerts.error'), t('alerts.revokeError'));
    } else {
      fetchSessions();
    }
  };

  return (
    <ScrollView style={globalStyles.safeArea} contentContainerStyle={globalStyles.scrollContent}>
      <Text style={globalStyles.subtitle}>{t('profile.securityTitle')}</Text>
      
      <View style={styles.section}>
        <SecurityForm onSubmitPasswordChange={handlePasswordChange} loading={loading} />
      </View>

      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>{t('profileScreen.activeSessions')}</Text>
      <Text style={[globalStyles.textSecondary, { marginBottom: theme.spacing.md }]}>
        {t('profileScreen.manageDevices')}
      </Text>

      {loadingSessions ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        sessions.map((sess) => (
          <View key={sess.token} style={globalStyles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                {sess.userAgent || t('profileScreen.unknownDevice')}
              </Text>
              <Text style={globalStyles.textSecondary}>
                {new Date(sess.createdAt).toLocaleDateString()}
              </Text>
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
  section: { marginTop: theme.spacing.md, marginBottom: theme.spacing.xl },
  sessionsTitle: { marginTop: theme.spacing.md },
  revokeButton: { padding: theme.spacing.sm }
});