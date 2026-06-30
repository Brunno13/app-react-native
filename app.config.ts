import { ExpoConfig, ConfigContext } from 'expo/config';
import { withStringsXml } from 'expo/config-plugins';

const APP_ENV = process.env.APP_ENV || 'staging';
const IS_PROD = APP_ENV === 'production';
const withDefaultFaceIDString = (config: ExpoConfig) => {
  return withStringsXml(config, (configProps) => {
    if (!configProps.modResults.resources.string) {
      configProps.modResults.resources.string = [];
    }

    const hasFaceID = configProps.modResults.resources.string.some(
      (s: any) => s.$ && s.$.name === 'NSFaceIDUsageDescription'
    );

    if (!hasFaceID) {
      configProps.modResults.resources.string.push({
        $: { name: 'NSFaceIDUsageDescription', translatable: 'false' },
        _: 'We use Face ID to ensure secure access to your account.'
      });
    }

    return configProps;
  });
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const baseConfig: ExpoConfig = {
    ...config,
    name: IS_PROD ? 'App Bun' : 'App Bun (Staging)',
    slug: 'app-react-native',
    scheme: 'app-react-native',
    version: '1.0.6',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',

    locales: {
      pt: './src/shared/config/i18n/expo-locales/pt.json',
      en: './src/shared/config/i18n/expo-locales/en.json',
    },
    
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
      'expo-sqlite',
      'expo-secure-store',
      'expo-local-authentication',
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ]
    ]
  };

  return withDefaultFaceIDString(baseConfig);
};