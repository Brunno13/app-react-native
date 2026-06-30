import { StyleSheet } from 'react-native';
import { useAppTheme } from '../providers/ThemeProvider';

export const useGlobalStyles = () => {
  const { colors, spacing, borderRadius } = useAppTheme();

  return StyleSheet.create({
    // --- Estrutura de Telas ---
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
    },

    // --- Tipografia ---
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.xl,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    textSecondary: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    linkText: {
      color: colors.link,
      fontSize: 15,
      fontWeight: '500',
      textAlign: 'center',
    },

    // --- Componentes Visuais ---
    avatarLarge: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarLargeText: {
      fontSize: 40,
      color: colors.surface,
      fontWeight: 'bold',
    },

    // --- Formulários e Validação ---
    input: {
      width: '100%',
      height: 50,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      color: colors.text, // Adicionado para garantir leitura correta do input no tema escuro
    },

    inputError: {
      borderColor: colors.danger,
    },

    formErrorText: {
      color: colors.danger,
      fontSize: 12,
      alignSelf: 'flex-start',
      marginBottom: spacing.md,
      marginTop: -spacing.sm,
    },

    // --- Listas, Menus e Cards ---
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: spacing.md,
      fontWeight: '500',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // --- Botões ---
    buttonPrimary: {
      width: '100%',
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDanger: {
      width: '100%',
      height: 50,
      backgroundColor: colors.danger,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
};