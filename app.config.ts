import { ExpoConfig, ConfigContext } from 'expo/config';
import {
  withStringsXml,
  withAndroidManifest,
  withDangerousMod,
  withGradleProperties,
  withAndroidStyles,
} from 'expo/config-plugins';
import fs from 'node:fs';
import path from 'node:path';

// ============================================================
// CI / APP CONFIG
// ============================================================

const loadCiConfig = (): Record<string, string> => {
  const envPath = path.resolve(
    process.cwd(),
    'ci',
    'artifacts.env',
  );

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const values: Record<string, string> = {};

  for (
    const rawLine of fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
  ) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line
      .slice(0, separatorIndex)
      .trim();

    let value = line
      .slice(separatorIndex + 1)
      .trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
};

const CI_CONFIG = loadCiConfig();

const configValue = (
  key: string,
  fallback: string,
): string => {
  return process.env[key] ||
    CI_CONFIG[key] ||
    fallback;
};

// ============================================================
// ENVIRONMENT
// ============================================================

const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ||
  process.env.APP_ENV ||
  'staging';

if (
  APP_ENV !== 'staging' &&
  APP_ENV !== 'production'
) {
  throw new Error(
    `APP_ENV inválido: ${APP_ENV}. ` +
      'Valores aceitos: staging | production',
  );
}

const IS_PROD = APP_ENV === 'production';

const DETOX_ENABLED =
  process.env.DETOX_ENABLED === 'true' ||
  process.env.DETOX_ENABLED === '1';

// ============================================================
// APP IDENTITY
// ============================================================

const APP_DISPLAY_NAME = configValue(
  'APP_DISPLAY_NAME',
  'App Bun',
);

const APP_STAGING_NAME_SUFFIX = configValue(
  'APP_STAGING_NAME_SUFFIX',
  ' (staging)',
);

const ANDROID_APPLICATION_ID = configValue(
  'ANDROID_APPLICATION_ID',
  'com.brunno.app',
);

const IOS_BUNDLE_IDENTIFIER = configValue(
  'IOS_BUNDLE_IDENTIFIER',
  'com.brunno.app',
);

const APP_STAGING_ID_SUFFIX = configValue(
  'APP_STAGING_ID_SUFFIX',
  '.staging',
);

const APP_NAME = IS_PROD
  ? APP_DISPLAY_NAME
  : `${APP_DISPLAY_NAME}${APP_STAGING_NAME_SUFFIX}`;

const ANDROID_PACKAGE = IS_PROD
  ? ANDROID_APPLICATION_ID
  : `${ANDROID_APPLICATION_ID}${APP_STAGING_ID_SUFFIX}`;

const IOS_BUNDLE_ID = IS_PROD
  ? IOS_BUNDLE_IDENTIFIER
  : `${IOS_BUNDLE_IDENTIFIER}${APP_STAGING_ID_SUFFIX}`;

const APP_SCHEME_BASE = configValue(
  'APP_SCHEME',
  'app-react-native',
);

const APP_STAGING_SCHEME_SUFFIX = configValue(
  'APP_STAGING_SCHEME_SUFFIX',
  '-staging',
);

const APP_SCHEME = IS_PROD
  ? APP_SCHEME_BASE
  : `${APP_SCHEME_BASE}${APP_STAGING_SCHEME_SUFFIX}`;

// ============================================================
// CONFIG PLUGINS
// ============================================================

const withDefaultFaceIDString = (
  config: ExpoConfig,
) => {
  return withStringsXml(
    config,
    (configProps) => {
      if (!configProps.modResults.resources.string) {
        configProps.modResults.resources.string = [];
      }

      const hasFaceID =
        configProps.modResults.resources.string.some(
          (s: any) =>
            s.$ &&
            s.$.name ===
              'NSFaceIDUsageDescription',
        );

      if (!hasFaceID) {
        configProps.modResults.resources.string.push({
          $: {
            name: 'NSFaceIDUsageDescription',
          },
          _:
            'We use Face ID to ensure secure access to your account.',
        });
      }

      return configProps;
    },
  );
};

const withAndroidLintStrings = (
  config: ExpoConfig,
) => {
  return withStringsXml(
    config,
    (configProps) => {
      const targets = new Set([
        'app_name',
        'expo_runtime_version',
      ]);

      for (
        const item of
          configProps.modResults.resources.string ??
          []
      ) {
        if (
          item.$?.name &&
          targets.has(item.$.name)
        ) {
          item.$.translatable = 'false';
          targets.delete(item.$.name);
        }
      }

      if (targets.size > 0) {
        throw new Error(
          'Expected Android string resources not found: ' +
            Array.from(targets).join(', '),
        );
      }

      return configProps;
    },
  );
};

const withGradleMetaspace = (
  config: ExpoConfig,
) => {
  return withGradleProperties(
    config,
    (configProps) => {
      const key = 'org.gradle.jvmargs';
      const metaspace =
        '-XX:MaxMetaspaceSize=1024m';

      const property =
        configProps.modResults.find(
          (item) =>
            item.type === 'property' &&
            item.key === key,
        );

      if (property?.type === 'property') {
        const currentValue =
          property.value ?? '';

        property.value =
          /-XX:MaxMetaspaceSize=\S+/.test(
            currentValue,
          )
            ? currentValue.replace(
                /-XX:MaxMetaspaceSize=\S+/,
                metaspace,
              )
            : (
                currentValue +
                ' ' +
                metaspace
              ).trim();
      } else {
        configProps.modResults.push({
          type: 'property',
          key,
          value:
            '-Xmx2048m ' + metaspace,
        });
      }

      return configProps;
    },
  );
};

const withLegacyStoragePermissionBounds = (
  config: ExpoConfig,
) => {
  return withAndroidManifest(
    config,
    (configProps) => {
      const manifest =
        configProps.modResults.manifest;

      const permissions =
        manifest['uses-permission'] ?? [];

      const writeExternalStorage =
        permissions.find(
          (permission) =>
            permission.$?.[
              'android:name'
            ] ===
            'android.permission.WRITE_EXTERNAL_STORAGE',
        );

      if (!writeExternalStorage) {
        throw new Error(
          'WRITE_EXTERNAL_STORAGE was not found in AndroidManifest',
        );
      }

      manifest.$ = manifest.$ ?? {};

      manifest.$['xmlns:tools'] =
        'http://schemas.android.com/tools';

      const permissionAttributes =
        writeExternalStorage.$;

      if (!permissionAttributes) {
        throw new Error(
          'WRITE_EXTERNAL_STORAGE attributes were not found',
        );
      }

      const storageAttributes:
        typeof permissionAttributes & {
          'android:maxSdkVersion'?: string;
          'tools:replace'?: string;
        } = permissionAttributes;

      storageAttributes[
        'android:maxSdkVersion'
      ] = '28';

      storageAttributes['tools:replace'] =
        'android:maxSdkVersion';

      return configProps;
    },
  );
};

// ============================================================
// STAGING NETWORK BYPASS
// ============================================================

// Roda APENAS em staging/dev.
const withNetworkSecurityConfig = (
  config: ExpoConfig,
) => {
  config = withDangerousMod(config, [
    'android',
    async (configProps) => {
      const resPath = path.join(
        configProps.modRequest
          .platformProjectRoot,
        'app/src/main/res/xml',
      );

      if (!fs.existsSync(resPath)) {
        fs.mkdirSync(resPath, {
          recursive: true,
        });
      }

      fs.writeFileSync(
        path.join(
          resPath,
          'network_security_config.xml',
        ),
        `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">brunnoserver.duckdns.org</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.100</domain>
    </domain-config>
</network-security-config>`,
      );

      return configProps;
    },
  ]);

  return withAndroidManifest(
    config,
    async (configProps) => {
      const androidManifest =
        configProps.modResults;

      const application =
        androidManifest.manifest
          .application?.[0];

      if (application) {
        application.$[
          'android:networkSecurityConfig'
        ] =
          '@xml/network_security_config';

        application.$[
          'android:usesCleartextTraffic'
        ] = 'true';
      }

      return configProps;
    },
  );
};

// ============================================================
// EXPO CONFIG
// ============================================================

const withSplashScreenBehaviorTargetApi = (
  config: ExpoConfig,
) => {
  return withAndroidStyles(
    config,
    (configProps) => {
      const styles =
        configProps.modResults.resources.style ??
        [];

      for (const style of styles) {
        if (
          style.$?.name !==
          'Theme.App.SplashScreen'
        ) {
          continue;
        }

        for (const item of style.item ?? []) {
          if (
            item.$?.name ===
            'android:windowSplashScreenBehavior'
          ) {
            item.$ = {
              ...item.$,
              'tools:targetApi': '33',
            };
          }
        }
      }

      configProps.modResults.resources.$ = {
        ...configProps.modResults.resources.$,
        'xmlns:tools':
          'http://schemas.android.com/tools',
      };

      return configProps;
    },
  );
};

export default ({
  config,
}: ConfigContext): ExpoConfig => {
  const plugins: any[] = [
    'expo-router',
    'expo-status-bar',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-sqlite',
    'expo-secure-store',
    'expo-local-authentication',
  ];

  if (DETOX_ENABLED) {
    plugins.push('@config-plugins/detox');
  }

  if (!IS_PROD) {
    plugins.push([
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ]);
  }

  const baseConfig: ExpoConfig = {
    ...config,

    name: APP_NAME,
    slug: 'app-react-native',
    scheme: APP_SCHEME,

    version: '1.0.8',
    orientation: 'portrait',
    backgroundColor: '#ffffff',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',

    locales: {
      pt:
        './src/shared/config/i18n/expo-locales/pt.json',
      en:
        './src/shared/config/i18n/expo-locales/en.json',
    },

    updates: {
      url:
        'https://u.expo.dev/0a0df4ff-385b-4b9c-a563-9b9ed7cd39f2',
      requestHeaders: {
        'expo-channel-name': IS_PROD
          ? 'production'
          : 'staging',
      },
    },

    runtimeVersion: {
      policy: 'appVersion',
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: IOS_BUNDLE_ID,
    },

    android: {
      backgroundColor: '#ffffff',

      adaptiveIcon: {
        foregroundImage:
          './assets/android-icon-foreground.png',
        monochromeImage:
          './assets/android-icon-monochrome.png',
        backgroundColor: '#ffffff',
      },

      package: ANDROID_PACKAGE,
    },

    extra: {
      appEnv: APP_ENV,
      appName: APP_NAME,
      appScheme: APP_SCHEME,
      androidApplicationId:
        ANDROID_PACKAGE,
      iosBundleIdentifier:
        IOS_BUNDLE_ID,

      eas: {
        projectId:
          '0a0df4ff-385b-4b9c-a563-9b9ed7cd39f2',
      },
    },

    plugins,
  };

  let finalConfig =
    withDefaultFaceIDString(baseConfig);

  finalConfig =
    withAndroidLintStrings(finalConfig);

  finalConfig =
    withGradleMetaspace(finalConfig);

  finalConfig =
    withLegacyStoragePermissionBounds(
      finalConfig,
    );
    
  finalConfig =
    withSplashScreenBehaviorTargetApi(
      finalConfig,
    );

  if (!IS_PROD) {
    finalConfig =
      withNetworkSecurityConfig(
        finalConfig,
      );
  }

  return finalConfig;
};
