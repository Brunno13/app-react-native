import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useGlobalAuth, useAuth } from '@/features/auth';
import { usePreferences } from '@/features/profile';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

export default function ProfileRoute() {
  const { session } = useGlobalAuth();
  const { signOut } = useAuth();
  const { preferences, toggleOfflineMode, updatePreferences, loading } = usePreferences(session?.user?.id);
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing, themePreference } = useAppTheme();
  const globalStyles = useGlobalStyles();
  const userAvatar = session?.user?.image;
  const initialLetter = session?.user?.name?.charAt(0).toUpperCase() || 'U';
  const avatarCacheBreaker = session?.user?.updatedAt 
    ? new Date(session.user.updatedAt).getTime() 
    : new Date().getTime();

  const optimizedAvatarUri = userAvatar ? `${userAvatar}?t=${avatarCacheBreaker}` : null;
  const isOfflineEnabled = preferences?.isOfflineModeEnabled ?? false;

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, justifyContent: 'space-between' },
    header: { alignItems: 'center' },
    avatarSpacing: { marginTop: spacing.md, marginBottom: spacing.lg },
    nameSpacing: { marginBottom: spacing.sm },
    emailSpacing: { marginBottom: spacing.xl },
    menuContainer: { flex: 1, width: '100%', marginTop: spacing.md },
    themeOptionButton: {
      flex: 1,
      padding: spacing.sm,
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
      borderWidth: 1,
    }
  }), [spacing]);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          {optimizedAvatarUri ? (
            <Image
              testID="profile-avatar"
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
        <ScrollView 
          testID="profile-scroll-view" 
          style={globalStyles.safeArea} 
          contentContainerStyle={[globalStyles.scrollContent, { paddingBottom: 100 }]}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={globalStyles.menuItem} onPress={() => router.push('/(main)/edit-profile')}>
              <FontAwesome name="pencil" size={20} color={colors.text} />
              <Text style={globalStyles.menuItemText}>{t('profileScreen.editProfile')}</Text>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity testID="link-to-security" style={globalStyles.menuItem} onPress={() => router.push('/(main)/security')}>
              <FontAwesome name="shield" size={20} color={colors.text} />
              <Text style={globalStyles.menuItemText}>{t('profileScreen.securityAndSessions')}</Text>
              <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[globalStyles.menuItem, { flexDirection: 'column', alignItems: 'flex-start' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <FontAwesome name="moon-o" size={20} color={colors.text} />
                <Text style={[globalStyles.menuItemText, { marginLeft: spacing.md }]}>{t('darkMode.darkModeTitle')}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: spacing.sm }}>
                {['light', 'dark', 'system'].map((themeOption) => {
                  const isActive = themePreference === themeOption;
                  return (
                    <TouchableOpacity
                      key={themeOption}
                      testID={`theme-option-${themeOption}`}
                      onPress={() => updatePreferences({ theme: themeOption as any })}
                      style={[
                        styles.themeOptionButton,
                        {
                          backgroundColor: isActive ? colors.primary : colors.background,
                          borderColor: isActive ? colors.primary : colors.border
                        }
                      ]}
                    >
                      <Text style={{
                        color: isActive ? '#FFFFFF' : colors.text,
                        fontWeight: 'bold',
                        fontSize: 12,
                        textTransform: 'uppercase'
                      }}>
                        {themeOption === 'light' ? t('darkMode.darkModeLight') : themeOption === 'dark' ? t('darkMode.darkModeDark') : t('darkMode.darkModeAuto')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[globalStyles.menuItem, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="wifi" size={20} color={isOfflineEnabled ? colors.textSecondary : colors.success} />
                <View style={{ marginLeft: spacing.md }}>
                  <Text style={{ fontWeight: 'bold', color: colors.text }}>{t('profileScreen.offlineMode')}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{t('profileScreen.offlineDesc')}</Text>
                </View>
              </View>
              <Switch
                testID="offline-switch"
                value={isOfflineEnabled}
                onValueChange={toggleOfflineMode}
                disabled={loading}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
          <TouchableOpacity testID="button-logout" style={globalStyles.buttonDanger} onPress={signOut}>
            <Text style={globalStyles.buttonText}>{t('profileScreen.logout')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}