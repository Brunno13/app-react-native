import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AuthScreenLayout } from './AuthScreenLayout';

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { SafeAreaView: View };
});

describe('AuthScreenLayout', () => {
  it('deve renderizar o conteúdo e repassar os testIDs dos containers', async () => {
    const { getByTestId, getByText } = await render(
      <AuthScreenLayout
        testID="auth-screen"
        containerTestID="auth-container"
      >
        <Text>Conteudo de autenticacao</Text>
      </AuthScreenLayout>
    );

    expect(getByTestId('auth-screen')).toBeTruthy();
    expect(getByTestId('auth-container')).toBeTruthy();
    expect(getByText('Conteudo de autenticacao')).toBeTruthy();
  });
});
