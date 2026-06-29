import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useGlobalAuth } from '@/features/auth';
import { useAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import { globalStyles } from '@/shared/ui/globalStyles';
import { theme } from '@/shared/ui/theme';

export const ProfileScreen = () => {
  const { session } = useGlobalAuth();
  const { signOut } = useAuth();
  const { preferences, toggleOfflineMode, loading } = usePreferences(session?.user?.id);
  const router = useRouter();
  const { t } = useTranslation();
  const userAvatar = session?.user?.image;
  const initialLetter = session?.user?.name?.charAt(0).toUpperCase() || 'U';
  const avatarCacheBreaker = session?.user?.updatedAt 
    ? new Date(session.user.updatedAt).getTime() 
    : new Date().getTime();

  const optimizedAvatarUri = userAvatar ? `${userAvatar}?t=${avatarCacheBreaker}` : null;

  const isOfflineEnabled = preferences?.isOfflineModeEnabled ?? false;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {optimizedAvatarUri ? (
            <Image 
              source={{ uri: optimizedAvatarUri }} 
              style={[globalStyles.avatarLarge, styles.avatarSpacing]} 
            />
          ) : (
            <View style={[globalStyles.avatarLarge, styles.avatarSpacing]}>
              <Text style={globalStyles.avatarLargeText}>{initialLetter}</Text>
            </View>
          )}

          <Text style={[globalStyles.subtitle, styles.nameSpacing]}>
            {session?.user?.name || t('home.defaultUser')}
          </Text>
          <Text style={[globalStyles.textSecondary, styles.emailSpacing]}>
            {session?.user?.email || t('profileScreen.defaultEmail')}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={globalStyles.menuItem} onPress={() => router.push('/(main)/edit-profile')}>
            <FontAwesome name="pencil" size={20} color={theme.colors.text} />
            <Text style={globalStyles.menuItemText}>{t('profileScreen.editProfile')}</Text>
            <FontAwesome name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={globalStyles.menuItem} onPress={() => router.push('/(main)/security')}>
            <FontAwesome name="shield" size={20} color={theme.colors.text} />
            <Text style={globalStyles.menuItemText}>{t('profileScreen.securityAndSessions')}</Text>
            <FontAwesome name="chevron-right" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <View style={[globalStyles.menuItem, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesome name="wifi" size={20} color={isOfflineEnabled ? theme.colors.textSecondary : theme.colors.success} />
              <View style={{ marginLeft: theme.spacing.md }}>
                <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{t('profileScreen.offlineMode')}</Text>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('profileScreen.offlineDesc')}</Text>
              </View>
            </View>
            <Switch 
              value={isOfflineEnabled}
              onValueChange={toggleOfflineMode}
              disabled={loading}
              trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            />
          </View>
        </View>
        
        <TouchableOpacity style={globalStyles.buttonDanger} onPress={signOut}>
          <Text style={globalStyles.buttonText}>{t('profileScreen.logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg, justifyContent: 'space-between' },
  header: { alignItems: 'center' },
  avatarSpacing: { marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
  nameSpacing: { marginBottom: theme.spacing.sm },
  emailSpacing: { marginBottom: theme.spacing.xl },
  menuContainer: { flex: 1, width: '100%', marginTop: theme.spacing.md },
});