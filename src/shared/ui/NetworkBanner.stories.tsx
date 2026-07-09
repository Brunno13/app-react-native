import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NetworkBanner } from './NetworkBanner';

const meta = {
  title: 'Shared UI/NetworkBanner',
  component: NetworkBanner,
} satisfies Meta<typeof NetworkBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveBanner = (args: any) => {
  const [isOffline, setIsOffline] = useState(args.isOffline);

  useEffect(() => {
    setIsOffline(args.isOffline);
  }, [args.isOffline]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => setIsOffline(!isOffline)}
          style={{ padding: 12, backgroundColor: isOffline ? '#4CAF50' : '#DC3545', borderRadius: 8 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Simular: {isOffline ? 'Conectar Internet' : 'Derrubar Internet'}
          </Text>
        </TouchableOpacity>
      </View>

      <NetworkBanner {...args} isOffline={isOffline} />
    </View>
  );
};

export const Offline: Story = {
  args: { isOffline: true },
  render: (args) => <InteractiveBanner {...args} />,
};

export const Online: Story = {
  args: { isOffline: false },
  render: (args) => <InteractiveBanner {...args} />,
};