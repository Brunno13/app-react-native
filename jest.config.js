module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/'
  ],
  // Coverage: codigo authored com comportamento executavel.
  // Barrels, tipos, dados declarativos, schemas e bootstrap nativo
  // ficam fora do denominador porque line coverage nao mede sua qualidade.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',

    // Public API barrels.
    '!src/features/auth/index.ts',
    '!src/features/profile/index.ts',
    '!src/shared/db/repositories/index.ts',
    '!src/shared/providers/index.ts',
    '!src/shared/ui/index.ts',

    // Type-only / dados declarativos.
    '!src/features/auth/types/auth.ts',
    '!src/shared/config/i18n/locales/*.ts',

    // Tooling, bootstrap nativo e schema declarativo.
    '!src/shared/config/storybook.config.ts',
    '!src/shared/db/client.ts',
    '!src/shared/db/schema/**',
  ],

  clearMocks: true,
};
