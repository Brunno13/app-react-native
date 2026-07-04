import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { SharedThemeProvider, useAppTheme } from './ThemeProvider';

jest.mock('../ui/theme', () => ({
  lightColors: { background: '#FFFFFF', text: '#000000' },
  darkColors: { background: '#000000', text: '#FFFFFF' },
  spacing: { mockSpacing: 100 },
  borderRadius: { mockBorder: 50 },
}));

const ThemeConsumer = () => {
  const { colors, spacing, borderRadius, isDark, themePreference } = useAppTheme();
  
  return (
    <View>
      <Text testID="color-bg">{(colors as any).background}</Text>
      <Text testID="spacing-mock">{(spacing as any).mockSpacing}</Text>
      <Text testID="border-mock">{(borderRadius as any).mockBorder}</Text>
      <Text testID="is-dark">{isDark.toString()}</Text>
      <Text testID="pref">{themePreference}</Text>
    </View>
  );
};

describe('SharedThemeProvider', () => {
  it('deve injetar lightColors quando isDark for false', async () => {
    const { getByTestId } = await render(
      <SharedThemeProvider isDark={false} themePreference="light">
        <ThemeConsumer />
      </SharedThemeProvider>
    );

    expect(getByTestId('color-bg').props.children).toBe('#FFFFFF');
    expect(getByTestId('is-dark').props.children).toBe('false');
    expect(getByTestId('pref').props.children).toBe('light');
  });

  it('deve injetar darkColors quando isDark for true', async () => {
    const { getByTestId } = await render(
      <SharedThemeProvider isDark={true} themePreference="dark">
        <ThemeConsumer />
      </SharedThemeProvider>
    );

    expect(getByTestId('color-bg').props.children).toBe('#000000');
    expect(getByTestId('is-dark').props.children).toBe('true');
    expect(getByTestId('pref').props.children).toBe('dark');
  });

  it('deve injetar darkColors mesmo se a preferência for system, desde que isDark seja true', async () => {
    const { getByTestId } = await render(
      <SharedThemeProvider isDark={true} themePreference="system">
        <ThemeConsumer />
      </SharedThemeProvider>
    );

    expect(getByTestId('color-bg').props.children).toBe('#000000');
    expect(getByTestId('pref').props.children).toBe('system');
  });

  it('deve repassar corretamente os tokens estáticos de espaçamento e bordas', async () => {
    const { getByTestId } = await render(
      <SharedThemeProvider isDark={false} themePreference="light">
        <ThemeConsumer />
      </SharedThemeProvider>
    );

    expect(getByTestId('spacing-mock').props.children).toBe(100);
    expect(getByTestId('border-mock').props.children).toBe(50);
  });
});