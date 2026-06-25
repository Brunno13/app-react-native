import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthFlow } from '../../features/auth/hooks/useAuth';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';

export const ProfileScreen = () => {
  const { session, signOut } = useAuthFlow();

  return (
    <View style={globalStyles.container}>
      <View style={[globalStyles.avatarLarge, styles.avatarSpacing]}>
        <Text style={globalStyles.avatarLargeText}>
          {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>

      <Text style={[globalStyles.subtitle, styles.nameSpacing]}>
        {session?.user?.name || 'Usuário'}
      </Text>
      
      <Text style={[globalStyles.textSecondary, styles.emailSpacing]}>
        {session?.user?.email || 'email@indisponivel.com'}
      </Text>
      
      <TouchableOpacity style={globalStyles.buttonDanger} onPress={signOut}>
        <Text style={globalStyles.buttonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarSpacing: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  nameSpacing: {
    marginBottom: theme.spacing.sm,
  },
  emailSpacing: {
    marginBottom: theme.spacing.xl,
  },
});