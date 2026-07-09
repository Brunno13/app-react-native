import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { AlertModal } from './AlertModal';

const meta = {
  title: 'Shared UI/AlertModal',
  component: AlertModal,
} satisfies Meta<typeof AlertModal>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveModal = (args: any) => {
  const [isVisible, setIsVisible] = useState(args.visible);

  useEffect(() => {
    setIsVisible(args.visible);
  }, [args.visible]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity 
        onPress={() => setIsVisible(true)}
        style={{ padding: 12, backgroundColor: '#333333', borderRadius: 8 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
          Reabrir Modal
        </Text>
      </TouchableOpacity>

      <AlertModal
        {...args}
        visible={isVisible}
        onConfirm={() => {
          setIsVisible(false);
          if (args.onConfirm) args.onConfirm();
        }}
      />
    </View>
  );
};

export const Success: Story = {
  args: {
    visible: true,
    title: 'Operação Concluída',
    message: 'Seus dados foram salvos com sucesso no servidor.',
    type: 'success',
    confirmText: 'Entendi',
    onConfirm: () => console.log('Modal de sucesso fechado'),
  },
  render: (args) => <InteractiveModal {...args} />,
};

export const Error: Story = {
  args: {
    visible: true,
    title: 'Falha na Autenticação',
    message: 'A senha informada está incorreta. Tente novamente.',
    type: 'error',
    confirmText: 'Fechar',
    onConfirm: () => console.log('Modal de erro fechado'),
  },
  render: (args) => <InteractiveModal {...args} />,
};

export const Info: Story = {
  args: {
    visible: true,
    title: 'Atualização Disponível',
    message: 'Uma nova versão do aplicativo está pronta para download.',
    type: 'info',
    confirmText: 'OK',
    onConfirm: () => console.log('Modal de info fechado'),
  },
  render: (args) => <InteractiveModal {...args} />,
};