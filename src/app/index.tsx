import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../shared/ui/theme';

export default function IndexScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}