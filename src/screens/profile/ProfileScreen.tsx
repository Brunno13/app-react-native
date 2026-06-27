import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthFlow } from '../../features/auth/hooks/useAuth';
import { globalStyles } from '../../shared/ui/globalStyles';
import { theme } from '../../shared/ui/theme';
import { FontAwesome } from '@expo/vector-icons';

export const ProfileScreen = () => {
  const { session, signOut } = useAuthFlow();
  const router = useRouter();

  const userAvatar = session?.user?.image;
  const initialLetter = session?.user?.name?.charAt(0).toUpperCase() || 'U';
  const avatarCacheBreaker = session?.user?.updatedAt 
    ? new Date(session.user.updatedAt).getTime() 
    : new Date().getTime();

  const optimizedAvatarUri = userAvatar 
    ? `${userAvatar}?t=${avatarCacheBreaker}` 
    : null;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          
          {optimizedAvatarUri ? (
            <Image 
              source={{ uri: optimizedAvatarUri }} 
              style={[globalStyles.avatarLarge, styles.avatarSpacing]} 
              onError={(error) => {
                console.error("❌ Erro ao renderizar imagem:", error.nativeEvent.error);
              }}
            />
          ) : (
            <View style={[globalStyles.avatarLarge, styles.avatarSpacing]}>
              <Text style={globalStyles.avatarLargeText}>
                {initialLetter}
              </Text>
            </View>
          )}

          <Text style={[globalStyles.subtitle, styles.nameSpacing]}>
            {session?.user?.name || 'Usuário'}
          </Text>
          <Text style={[globalStyles.textSecondary, styles.emailSpacing]}>
            {session?.user?.email || 'email@indisponivel.com'}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={globalStyles.menuItem} 
            onPress={() => router.push('/(main)/edit-profile')}
          >
            <FontAwesome name="pencil" size={20} color={theme.colors.text} />
            <Text style={globalStyles.menuItemText}>Editar Dados do Perfil</Text>
            <FontAwesome name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.menuItem} 
            onPress={() => router.push('/(main)/security')}
          >
            <FontAwesome name="shield" size={20} color={theme.colors.text} />
            <Text style={globalStyles.menuItemText}>Segurança e Sessões</Text>
            <FontAwesome name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={globalStyles.buttonDanger} onPress={signOut}>
          <Text style={globalStyles.buttonText}>Sair da Conta</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  avatarSpacing: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  nameSpacing: {
    marginBottom: theme.spacing.sm,
  },
  emailSpacing: {
    marginBottom: theme.spacing.xl,
  },
  menuContainer: {
    flex: 1,
    width: '100%',
    marginTop: theme.spacing.md,
  },
});