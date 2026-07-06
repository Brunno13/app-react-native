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
    
    const { expoClient } = require('@better-auth/expo/client');
    const { createAuthClient } = require('better-auth/react');
    const { authClient } = require('./auth');

    expect(expoClient).toHaveBeenCalledTimes(1);
    expect(expoClient).toHaveBeenCalledWith(expect.objectContaining({
      scheme: 'app-react-native',
      storage: expect.objectContaining({
        getItemAsync: expect.any(Function),
        setItemAsync: expect.any(Function),
        deleteItemAsync: expect.any(Function),
      }),
    }));

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