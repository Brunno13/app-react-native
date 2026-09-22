import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenLayoutProps {
  children: ReactNode;
  testID?: string;
  containerTestID?: string;
}

export const AuthScreenLayout = ({
  children,
  testID,
  containerTestID,
}: AuthScreenLayoutProps) => (
  <SafeAreaView style={styles.safeArea} testID={testID}>
    <View style={styles.container} testID={containerTestID}>
      {children}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
