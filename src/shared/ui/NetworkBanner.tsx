import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '@/shared/ui/theme';

interface NetworkBannerProps {
  isOffline: boolean;
}

export const NetworkBanner = ({ isOffline }: NetworkBannerProps) => {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (isOffline) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.offlineBanner, 
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={styles.offlineText}>
        {t('alerts.networkError') || 'Sem conexão com a internet'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.dangerDark,
    paddingTop: 55,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998, 
  },
  offlineText: {
    color: theme.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
});