import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';
import { FontAwesome } from '@expo/vector-icons';

export const SecurityScreen = () => {
  const { changePassword, getActiveSessions, revokeDeviceSession, loading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data, error } = await getActiveSessions();
    if (data) setSessions(data);
    setLoadingSessions(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Aviso', 'Preencha as senhas corretamente.');
      return;
    }

    const { error } = await changePassword(newPassword, currentPassword);
    
    if (error) {
      Alert.alert('Erro', error.message || 'Não foi possível alterar a senha.');
    } else {
      Alert.alert('Sucesso', 'Sua senha foi alterada. Outros dispositivos foram desconectados.');
      setCurrentPassword('');
      setNewPassword('');
      fetchSessions();
    }
  };

  const handleRevoke = async (token: string) => {
    const { error } = await revokeDeviceSession(token);
    if (error) {
      Alert.alert('Erro', 'Não foi possível desconectar o dispositivo.');
    } else {
      fetchSessions();
    }
  };

  return (
    <ScrollView style={globalStyles.safeArea} contentContainerStyle={globalStyles.scrollContent}>
      <Text style={globalStyles.subtitle}>Trocar Senha</Text>
      <View style={styles.section}>
        <TextInput
          style={globalStyles.input}
          placeholder="Senha Atual"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="Nova Senha"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Atualizar Senha</Text>}
        </TouchableOpacity>
      </View>

      <Text style={[globalStyles.subtitle, styles.sessionsTitle]}>Sessões Ativas</Text>
      <Text style={[globalStyles.textSecondary, { marginBottom: theme.spacing.md }]}>
        Gerencie os dispositivos conectados à sua conta.
      </Text>

      {loadingSessions ? (
        <ActivityIndicator color={theme.colors.primary} size="large" style={{ marginTop: 20 }} />
      ) : (
        sessions.map((sess) => (
          <View key={sess.token} style={globalStyles.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>
                {sess.userAgent || 'Dispositivo Desconhecido'}
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
  section: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sessionsTitle: {
    marginTop: theme.spacing.md,
  },
  revokeButton: {
    padding: theme.spacing.sm,
  }
});