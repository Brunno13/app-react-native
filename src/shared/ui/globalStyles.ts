import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const globalStyles = StyleSheet.create({
  // --- Estrutura de Telas ---
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },

  // --- Tipografia ---
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  linkText: {
    color: theme.colors.link,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },

  // --- Formulários ---
  input: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },

  // --- Botões ---
  buttonPrimary: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDanger: {
    width: '100%',
    height: 50,
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});