import { en } from './locales/en';
import { pt } from './locales/pt';

interface I18nInitConfig {
  resources: unknown;
  lng: string;
  fallbackLng: string;
  interpolation: {
    escapeValue: boolean;
  };
}

const loadI18n = (languageCode?: string) => {
  jest.resetModules();

  const mockGetLocales = jest.fn(() =>
    languageCode === undefined ? [] : [{ languageCode }],
  );

  const mockInit = jest.fn<void, [I18nInitConfig]>();

  const mockPlugin = {
    type: '3rdParty',
    init: jest.fn(),
  };

  const mockUse = jest.fn<
    { init: typeof mockInit },
    [typeof mockPlugin]
  >(() => ({
    init: mockInit,
  }));

  const mockI18n = {
    use: mockUse,
  };

  jest.doMock('expo-localization', () => ({
    getLocales: mockGetLocales,
  }));

  jest.doMock('i18next', () => ({
    __esModule: true,
    default: mockI18n,
  }));

  jest.doMock('react-i18next', () => ({
    initReactI18next: mockPlugin,
  }));

  const { default: configuredI18n } = jest.requireActual<typeof import('./index')>('./index');

  return {
    configuredI18n,
    mockGetLocales,
    mockInit,
    mockUse,
    mockI18n,
    mockPlugin,
  };
};

describe('i18n bootstrap', () => {
  it('deve inicializar usando o idioma do dispositivo', () => {
    const {
      configuredI18n,
      mockGetLocales,
      mockInit,
      mockUse,
      mockI18n,
      mockPlugin,
    } = loadI18n('en');

    expect(mockGetLocales).toHaveBeenCalledTimes(1);
    expect(mockUse).toHaveBeenCalledWith(mockPlugin);
    expect(mockInit).toHaveBeenCalledTimes(1);

    const initConfig = mockInit.mock.calls[0]?.[0];

    expect(initConfig).toBeDefined();
    expect(initConfig?.resources).toEqual({ pt, en });
    expect(initConfig?.lng).toBe('en');
    expect(initConfig?.fallbackLng).toBe('en');
    expect(initConfig?.interpolation).toEqual({
      escapeValue: false,
    });
    expect(configuredI18n).toBe(mockI18n);
  });

  it('deve usar pt quando o dispositivo nao informar idioma', () => {
    const { mockGetLocales, mockInit } = loadI18n();

    expect(mockGetLocales).toHaveBeenCalledTimes(1);
    expect(mockInit).toHaveBeenCalledTimes(1);

    const initConfig = mockInit.mock.calls[0]?.[0];

    expect(initConfig?.lng).toBe('pt');
  });
});
