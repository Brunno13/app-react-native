import { ExpoConfig, ConfigContext } from 'expo/config';
import { withStringsXml, withAndroidManifest, withDangerousMod, withGradleProperties } from 'expo/config-plugins';
import fs from 'node:fs';
import path from 'node:path';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || 'staging';
const IS_PROD = APP_ENV === 'production';
const DETOX_ENABLED =
  process.env.DETOX_ENABLED === 'true' ||
  process.env.DETOX_ENABLED === '1';
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
        $: { name: 'NSFaceIDUsageDescription' },
        _: 'We use Face ID to ensure secure access to your account.'
      });
    }

    return configProps;
  });
};

const withAndroidLintStrings = (config: ExpoConfig) => {
  return withStringsXml(config, (configProps) => {
    const targets = new Set([
      'app_name',
      'expo_runtime_version',
    ]);

    for (const item of configProps.modResults.resources.string ?? []) {
      if (item.$?.name && targets.has(item.$.name)) {
        item.$.translatable = 'false';
        targets.delete(item.$.name);
      }
    }

    if (targets.size > 0) {
      throw new Error(
        'Expected Android string resources not found: ' +
        Array.from(targets).join(', ')
      );
    }

    return configProps;
  });
};

const withGradleMetaspace = (config: ExpoConfig) => {
  return withGradleProperties(config, (configProps) => {
    const key = 'org.gradle.jvmargs';
    const metaspace = '-XX:MaxMetaspaceSize=1024m';

    const property = configProps.modResults.find(
      (item) => item.type === 'property' && item.key === key
    );

    if (property?.type === 'property') {
      const currentValue = property.value ?? '';

      property.value = /-XX:MaxMetaspaceSize=\S+/.test(currentValue)
        ? currentValue.replace(
            /-XX:MaxMetaspaceSize=\S+/,
            metaspace
          )
        : (currentValue + ' ' + metaspace).trim();
    } else {
      configProps.modResults.push({
        type: 'property',
        key,
        value: '-Xmx2048m ' + metaspace,
      });
    }

    return configProps;
  });
};

// Plugin de Bypass de Rede (Roda APENAS em Staging/Dev)
const withNetworkSecurityConfig = (config: ExpoConfig) => {
  config = withDangerousMod(config, [
    'android',
    async (configProps) => {
      const resPath = path.join(configProps.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(resPath, 'network_security_config.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">brunnoserver.duckdns.org</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.100</domain> 
    </domain-config>
</network-security-config>`
      );
      return configProps;
    },
  ]);

  return withAndroidManifest(config, async (configProps) => {
    const androidManifest = configProps.modResults;
    const application = androidManifest.manifest.application?.[0];

    if (application) {
      application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
      application.$['android:usesCleartextTraffic'] = 'true';
    }

    return configProps;
  });
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins: any[] = [
    "expo-router",
    "expo-status-bar",
    'expo-sqlite',
    'expo-secure-store',
    'expo-local-authentication',
  ];

  if (DETOX_ENABLED) {
    plugins.push('@config-plugins/detox');
  }

  if (!IS_PROD) {
    plugins.push([
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true
        }
      }
    ]);
  }

  const baseConfig: ExpoConfig = {
    ...config,
    name: IS_PROD ? 'App Bun' : 'App Bun (Staging)',
    slug: 'app-react-native',
    scheme: 'app-react-native',
    version: '1.0.8',
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
      eas: {
        projectId: "0a0df4ff-385b-4b9c-a563-9b9ed7cd39f2"
      }
    },
    
    plugins
  };

  let finalConfig = withDefaultFaceIDString(baseConfig);
  finalConfig = withAndroidLintStrings(finalConfig);
  finalConfig = withGradleMetaspace(finalConfig);

  if (!IS_PROD) {
    finalConfig = withNetworkSecurityConfig(finalConfig);
  }

  return finalConfig;
};