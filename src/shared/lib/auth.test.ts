jest.mock('@/shared/config/env', () => ({
  ENV: {
    API_URL: 'https://api.meuappseguro.com',
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@better-auth/expo/client', () => ({
  expoClient: jest.fn(() => 'mock-expo-plugin-instance'),
}));

jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn(() => 'mock-auth-client-instance'),
}));

describe('Auth Library Configuration', () => {

  beforeEach(() => {
    jest.resetModules();
  });

  it('deve configurar e exportar o authClient com as opções, plugins e headers corretos', () => {

    const expoModule = jest.requireMock<typeof import('@better-auth/expo/client')>('@better-auth/expo/client');
    const authReactModule = jest.requireMock<typeof import('better-auth/react')>('better-auth/react');
    const secureStoreModule = jest.requireMock<typeof import('expo-secure-store')>('expo-secure-store');
    const { authClient } = jest.requireActual<typeof import('./auth')>('./auth');

    const expoClient = jest.mocked(expoModule.expoClient);
    const createAuthClient = jest.mocked(authReactModule.createAuthClient);

    expect(expoClient).toHaveBeenCalledTimes(1);

    const expoOptions = expoClient.mock.calls[0]?.[0];

    expect(expoOptions).toBeDefined();
    expect(expoOptions?.scheme).toBe('app-react-native');
    expect(expoOptions?.storage).toMatchObject({
      getItemAsync: secureStoreModule.getItemAsync,
      setItemAsync: secureStoreModule.setItemAsync,
      deleteItemAsync: secureStoreModule.deleteItemAsync,
    });

    expect(createAuthClient).toHaveBeenCalledTimes(1);
    expect(createAuthClient).toHaveBeenCalledWith({
      baseURL: 'https://api.meuappseguro.com',
      plugins: ['mock-expo-plugin-instance'],
      fetchOptions: {
        headers: {
          Origin: 'https://api.meuappseguro.com',
        },
      },
    });

    expect(authClient).toBe('mock-auth-client-instance');
  });
});