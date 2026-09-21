import React from 'react';
import { render } from '@testing-library/react-native';
import IndexScreen from '@/app/index';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { borderRadius, lightColors, spacing } from '@/shared/ui/theme';

jest.mock('@/shared/providers/ThemeProvider', () => ({
  useAppTheme: jest.fn(),
}));

const mockedUseAppTheme = jest.mocked(useAppTheme);

describe('IndexScreen', () => {
  beforeEach(() => {
    mockedUseAppTheme.mockReturnValue({
      colors: lightColors,
      spacing,
      borderRadius,
      isDark: false,
      themePreference: 'light',
    });
  });

  it('deve renderizar o loading usando a cor primaria do tema', async () => {
    const { getByTestId } = await render(<IndexScreen />);

    const indicator = getByTestId('index-loading-indicator');

    expect(mockedUseAppTheme).toHaveBeenCalledTimes(1);
    expect(indicator).toHaveProp('size', 'large');
    expect(indicator).toHaveProp('color', lightColors.primary);
  });
});
