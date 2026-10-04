const fs = require('fs');
const path = require('path');

const isWindows =
  process.platform === 'win32';

const gradleCmd =
  isWindows
    ? 'gradlew.bat'
    : './gradlew';

// ============================================================
// CI / ARTIFACT ENV
// ============================================================

const artifactEnvPath = path.join(
  __dirname,
  'ci',
  'artifacts.env',
);

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Arquivo de configuração não encontrado: ${filePath}`,
    );
  }

  const env = {};

  const content =
    fs.readFileSync(
      filePath,
      'utf8',
    );

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (
      !line ||
      line.startsWith('#')
    ) {
      continue;
    }

    const separatorIndex =
      line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key =
      line
        .slice(0, separatorIndex)
        .trim();

    let value =
      line
        .slice(separatorIndex + 1)
        .trim();

    if (
      (
        value.startsWith('"') &&
        value.endsWith('"')
      ) ||
      (
        value.startsWith("'") &&
        value.endsWith("'")
      )
    ) {
      value =
        value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
};

const artifactEnv =
  loadEnvFile(artifactEnvPath);

// ============================================================
// ARTIFACT NAMES
// ============================================================

const artifactBasename =
  artifactEnv.ARTIFACT_BASENAME;

const iosProductName =
  artifactEnv.IOS_PRODUCT_NAME;

if (!artifactBasename) {
  throw new Error(
    'ARTIFACT_BASENAME não definido em ci/artifacts.env',
  );
}

if (!iosProductName) {
  throw new Error(
    'IOS_PRODUCT_NAME não definido em ci/artifacts.env',
  );
}

const androidBinaryPath =
  `./${artifactBasename}-production.apk`;

const iosBinaryPath =
  path.join(
    'ios_build',
    'Build',
    'Products',
    'Release-iphonesimulator',
    `${iosProductName}.app`,
  );

// ============================================================
// DETOX
// ============================================================

/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    provider: 'jest',
  },

  apps: {
    'android.release': {
      type: 'android.apk',
      binaryPath:
        androidBinaryPath,

      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',

      build:
        `bunx cross-env DETOX_ENABLED=true bun run build:apk:prod && cd android && ${gradleCmd} :app:assembleAndroidTest -DtestBuildType=release && cd ..`,
    },

    'ios.release': {
      type: 'ios.app',

      binaryPath:
        iosBinaryPath,

      build:
        'bunx cross-env DETOX_ENABLED=true bun run build:ios:prod',
    },
  },

  devices: {
    emulator: {
      type: 'android.emulator',

      device: {
        avdName: 'Pixel_10',
      },
    },

    simulator: {
      type: 'ios.simulator',

      device: {
        type: 'iPhone 15',
      },
    },
  },

  configurations: {
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },

    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
  },
};
