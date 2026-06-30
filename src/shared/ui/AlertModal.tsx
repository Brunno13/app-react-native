import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';
import type { ToastType } from './Toast';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type: ToastType;
  onConfirm: () => void;
  confirmText?: string;
}

export const AlertModal = ({ visible, title, message, type, onConfirm, confirmText = 'OK' }: AlertModalProps) => {
  const { colors } = useAppTheme();
  const globalStyles = useGlobalStyles();

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'check-circle' as const, color: colors.success };
      case 'error': return { name: 'times-circle' as const, color: colors.danger };
      default: return { name: 'info-circle' as const, color: colors.info };
    }
  };

  const iconData = getIcon();

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    icon: { marginBottom: 16 },
    centerText: { textAlign: 'center' },
    messageSpacing: { marginBottom: 24, marginTop: 8 },
  }), [colors]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <FontAwesome name={iconData.name} size={60} color={iconData.color} style={styles.icon} />
          
          <Text style={[globalStyles.title, styles.centerText]}>{title}</Text>
          <Text style={[globalStyles.textSecondary, styles.centerText, styles.messageSpacing]}>{message}</Text>
          
          <TouchableOpacity 
            style={[globalStyles.buttonPrimary, { backgroundColor: iconData.color }]} 
            onPress={onConfirm}
          >
            <Text style={globalStyles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};