import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useGlobalStyles } from '@/shared/ui/globalStyles';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  title: string;
  message: string;
  type: ToastType;
  onHide: () => void;
}

export const Toast = ({ visible, title, message, type, onHide }: ToastProps) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const { colors } = useAppTheme();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 50,
        useNativeDriver: true,
        bounciness: 12,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (visible) onHide();
    });
  };

  const getToastColors = () => {
    switch (type) {
      case 'success': 
        return { bg: colors.successLight, border: colors.success, icon: colors.success, iconName: 'check-circle' as const };
      case 'error': 
        return { bg: colors.dangerLight, border: colors.danger, icon: colors.danger, iconName: 'exclamation-circle' as const };
      default: 
        return { bg: colors.infoLight, border: colors.info, icon: colors.info, iconName: 'info-circle' as const };
    }
  };

  const toastTheme = getToastColors();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      borderRadius: 8,
      borderLeftWidth: 6,
      padding: 16,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      zIndex: 9999,
    },
    content: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginRight: 16 },
    textContainer: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 16, color: colors.text, marginBottom: 4 },
  }), [colors]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], borderLeftColor: toastTheme.border, backgroundColor: toastTheme.bg }]}>
      <TouchableOpacity style={styles.content} onPress={hideToast} activeOpacity={0.8}>
        <FontAwesome name={toastTheme.iconName} size={24} color={toastTheme.icon} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={globalStyles.textSecondary}>{message}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};