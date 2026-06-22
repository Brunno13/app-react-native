import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV || 'staging';
const IS_PROD = APP_ENV === 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_PROD ? 'App Bun' : 'App Bun (Staging)',
  slug: 'app-react-native',
  scheme: 'app-react-native',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  
  ios: {
    supportsTablet: true,
    bundleIdentifier: IS_PROD ? 'com.brunno.app' : 'com.brunno.app.staging',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff'
    },
    package: IS_PROD ? 'com.brunno.app' : 'com.brunno.app.staging',
  },
  extra: {
    apiUrl: IS_PROD 
      ? 'http://api-bun.brunnoserver.duckdns.org' 
      : 'http://api-bun-staging.brunnoserver.duckdns.org',
  },
  
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true
        }
      }
    ]
  ]
});