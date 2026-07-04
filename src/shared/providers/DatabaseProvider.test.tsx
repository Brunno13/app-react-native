import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, useColorScheme } from 'react-native';
import { DatabaseProvider, useDatabase } from './DatabaseProvider';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  useMigrations: jest.fn(),
}));

jest.mock('@/shared/db/client', () => ({
  db: { mockId: 'instancia-sqlite-singleton' },
}));

jest.mock('@/shared/db/migrations/migrations', () => ({
  mockMigration: true,
}));

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => {
  return { default: jest.fn() };
});

jest.mock('@/shared/ui/theme', () => ({
  lightColors: { background: '#fff', danger: '#ff0000', textSecondary: '#666', primary: '#0000ff' },
  darkColors: { background: '#000', danger: '#ff4444', textSecondary: '#999', primary: '#4444ff' },
}));

describe('DatabaseProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockUseColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
    mockUseColorScheme.mockReturnValue('light');
  });

  it('deve exibir a tela de carregamento enquanto as migrations estão sendo aplicadas', async () => {
    (useMigrations as jest.Mock).mockReturnValue({ success: false, error: undefined });

    const { getByText, queryByText } = await render(
      <DatabaseProvider>
        <Text>Conteúdo Seguro do App</Text>
      </DatabaseProvider>
    );

    expect(getByText('database.optimizing')).toBeTruthy();
    expect(queryByText('Conteúdo Seguro do App')).toBeNull();
  });

  it('deve exibir a tela de erro fatal se a migration falhar e bloquear o acesso ao app', async () => {
    const criticalError = new Error('Falha de permissão no disco (I/O)');
    (useMigrations as jest.Mock).mockReturnValue({ success: false, error: criticalError });

    const { getByText, queryByText } = await render(
      <DatabaseProvider>
        <Text>Conteúdo Seguro do App</Text>
      </DatabaseProvider>
    );

    expect(getByText('database.criticalError')).toBeTruthy();
    expect(getByText('Falha de permissão no disco (I/O)')).toBeTruthy();
    expect(queryByText('Conteúdo Seguro do App')).toBeNull();
  });

  it('deve renderizar as childrens normalmente se as migrations rodarem com sucesso', async () => {
    (useMigrations as jest.Mock).mockReturnValue({ success: true, error: undefined });

    const { getByText, queryByText } = await render(
      <DatabaseProvider>
        <Text>Conteúdo Seguro do App</Text>
      </DatabaseProvider>
    );

    expect(getByText('Conteúdo Seguro do App')).toBeTruthy();
    expect(queryByText('database.optimizing')).toBeNull();
    expect(queryByText('database.criticalError')).toBeNull();
  });

  it('deve prover a instância de banco correta pelo hook useDatabase', async () => {
    (useMigrations as jest.Mock).mockReturnValue({ success: true, error: undefined });

    const DbConsumer = () => {
      const { db } = useDatabase();
      return <Text>{(db as any).mockId}</Text>;
    };

    const { getByText } = await render(
      <DatabaseProvider>
        <DbConsumer />
      </DatabaseProvider>
    );

    expect(getByText('instancia-sqlite-singleton')).toBeTruthy();
  });
});