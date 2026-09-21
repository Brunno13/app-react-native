import { renderHook } from '@testing-library/react-native';
import { useGlobalStyles } from './globalStyles';
import { useAppTheme } from '../providers/ThemeProvider';
import { borderRadius, lightColors, spacing } from './theme';

jest.mock('../providers/ThemeProvider', () => ({
  useAppTheme: jest.fn(),
}));

const mockedUseAppTheme = jest.mocked(useAppTheme);

describe('useGlobalStyles', () => {
  beforeEach(() => {
    mockedUseAppTheme.mockReturnValue({
      colors: lightColors,
      spacing,
      borderRadius,
      isDark: false,
      themePreference: 'light',
    });
  });

  it('deve criar estilos a partir dos tokens do tema', async () => {
    const { result } = await renderHook(() => useGlobalStyles());

    expect(mockedUseAppTheme).toHaveBeenCalledTimes(1);
    expect(result.current.safeArea.backgroundColor).toBe(lightColors.background);
    expect(result.current.container.padding).toBe(spacing.lg);
    expect(result.current.input.borderRadius).toBe(borderRadius.md);
    expect(result.current.input.borderColor).toBe(lightColors.border);
    expect(result.current.buttonPrimary.backgroundColor).toBe(lightColors.primary);
    expect(result.current.buttonDanger.backgroundColor).toBe(lightColors.danger);
  });
});
