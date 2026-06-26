import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV || 'staging';
const IS_PROD = APP_ENV === 'production';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_PROD ? 'App Bun' : 'App Bun (Staging)',
  slug: 'app-react-native',
  scheme: 'app-react-native',
  version: '1.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  
  updates: {
    url: "https://u.expo.dev/0a0df4ff-385b-4b9c-a563-9b9ed7cd39f2",
    requestHeaders: {
      "expo-channel-name": IS_PROD ? "production" : "staging"
    }
  },
  
  runtimeVersion: {
    policy: "appVersion"
  },
  
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
      
    eas: {
      projectId: "0a0df4ff-385b-4b9c-a563-9b9ed7cd39f2"
    }
  },
  
  plugins: [
    "expo-router",
    "expo-status-bar",
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