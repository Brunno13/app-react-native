import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { ErrorFallback } from './ErrorFallback';

const meta = {
  title: 'Shared UI/ErrorFallback',
  component: ErrorFallback,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, width: '100%', height: '100%' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ErrorFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockError = new Error('Erro catastrófico simulado pelo Storybook. O sistema não conseguiu renderizar a árvore de componentes.');

export const Default: Story = {
  args: {
    error: mockError,
    resetErrorBoundary: () => console.log('Tentando novamente... [Recarregando App]'), 
  },
};