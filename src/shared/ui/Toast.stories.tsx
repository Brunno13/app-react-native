import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Toast } from './Toast';

const meta = {
  title: 'Shared UI/Toast',
  component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveToast = (args: any) => {
  const [isVisible, setIsVisible] = useState(args.visible);

  useEffect(() => {
    setIsVisible(args.visible);
  }, [args.visible]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setIsVisible(true)}
          style={{ padding: 12, backgroundColor: '#333333', borderRadius: 8 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Disparar Toast
          </Text>
        </TouchableOpacity>
      </View>

      <Toast
        {...args}
        visible={isVisible}
        onHide={() => {
          setIsVisible(false); 
          if (args.onHide) args.onHide();
        }}
      />
    </View>
  );
};

export const Success: Story = {
  args: { visible: true, title: 'Sucesso', message: 'Perfil atualizado com sucesso.', type: 'success', onHide: () => console.log('Toast escondido') },
  render: (args) => <InteractiveToast {...args} />,
};

export const Error: Story = {
  args: { visible: true, title: 'Erro', message: 'Não foi possível conectar ao servidor.', type: 'error', onHide: () => console.log('Toast escondido') },
  render: (args) => <InteractiveToast {...args} />,
};

export const Info: Story = {
  args: { visible: true, title: 'Aviso', message: 'Seu token expira em 5 minutos.', type: 'info', onHide: () => console.log('Toast escondido') },
  render: (args) => <InteractiveToast {...args} />,
};