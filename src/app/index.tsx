import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

export default function IndexScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}