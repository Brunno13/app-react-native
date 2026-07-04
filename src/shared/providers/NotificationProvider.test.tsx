import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NotificationProvider, useNotification } from './NotificationProvider';

let simulateNetworkChange: ((state: any) => void) | null = null;

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    simulateNetworkChange = callback;
    return jest.fn();
  }),
}));

jest.mock('@/shared/ui/Toast', () => {
  const { Text } = require('react-native');
  return {
    Toast: ({ visible, title, message, type, onHide }: any) => {
      if (!visible) return null;
      return <Text testID="mock-toast" onPress={onHide}>{`${title}|${message}|${type}`}</Text>;
    }
  };
});

jest.mock('@/shared/ui/AlertModal', () => {
  const { Text } = require('react-native');
  return {
    AlertModal: ({ visible, title, message, type, onConfirm }: any) => {
      if (!visible) return null;
      return <Text testID="mock-modal" onPress={onConfirm}>{`${title}|${message}|${type}`}</Text>;
    }
  };
});

jest.mock('@/shared/ui/NetworkBanner', () => {
  const { Text } = require('react-native');
  return {
    NetworkBanner: ({ isOffline }: any) => {
      return <Text testID="mock-network-banner">{isOffline ? 'STATUS: OFFLINE' : 'STATUS: ONLINE'}</Text>;
    }
  };
});

const TestConsumer = () => {
  const { showToast, showModal } = useNotification();
  return (
    <View>
      <TouchableOpacity 
        testID="btn-toast" 
        onPress={() => showToast('Sucesso', 'Salvo com sucesso', 'success')} 
      />
      <TouchableOpacity 
        testID="btn-modal" 
        onPress={() => showModal('Erro', 'Falha ao deletar', 'error')} 
      />
    </View>
  );
};

describe('NotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulateNetworkChange = null;
  });

  it('deve inicializar com Toast e Modal ocultos, e a rede ONLINE', async () => {
    const { queryByTestId, getByTestId } = await render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>
    );

    expect(queryByTestId('mock-toast')).toBeNull();
    expect(queryByTestId('mock-modal')).toBeNull();
    expect(getByTestId('mock-network-banner').props.children).toBe('STATUS: ONLINE');
  });

  it('deve exibir e ocultar o Toast corretamente chamando o context', async () => {
    const { getByTestId, queryByTestId } = await render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-toast'));
    });

    const toast = getByTestId('mock-toast');
    expect(toast).toBeTruthy();
    expect(toast.props.children).toBe('Sucesso|Salvo com sucesso|success');

    await act(async () => {
      fireEvent.press(toast);
    });

    expect(queryByTestId('mock-toast')).toBeNull();
  });

  it('deve exibir e ocultar o Modal corretamente chamando o context', async () => {
    const { getByTestId, queryByTestId } = await render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>
    );

    await act(async () => {
      fireEvent.press(getByTestId('btn-modal'));
    });

    const modal = getByTestId('mock-modal');
    expect(modal).toBeTruthy();
    expect(modal.props.children).toBe('Erro|Falha ao deletar|error');

    await act(async () => {
      fireEvent.press(modal);
    });

    expect(queryByTestId('mock-modal')).toBeNull();
  });

  it('deve atualizar o NetworkBanner ao perder e ao recuperar a conexão via NetInfo', async () => {
    const { getByTestId } = await render(
      <NotificationProvider>
        <TestConsumer />
      </NotificationProvider>
    );

    const banner = getByTestId('mock-network-banner');
    expect(banner.props.children).toBe('STATUS: ONLINE');

    await act(async () => {
      if (simulateNetworkChange) {
        simulateNetworkChange({ isConnected: true, isInternetReachable: false });
      }
    });

    expect(banner.props.children).toBe('STATUS: OFFLINE');

    await act(async () => {
      if (simulateNetworkChange) {
        simulateNetworkChange({ isConnected: true, isInternetReachable: true });
      }
    });

    expect(banner.props.children).toBe('STATUS: ONLINE');
  });

  it('deve assinar e desassinar o evento do NetInfo ao montar/desmontar o Provider', async () => {
    const mockUnsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValueOnce(mockUnsubscribe);

    const { unmount } = await render(
      <NotificationProvider>
        <View />
      </NotificationProvider>
    );

    expect(NetInfo.addEventListener).toHaveBeenCalled();

    await act(async () => {
      unmount();
    });

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});