const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';
const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew'; 

let iosAppPath = 'ios_build/Build/Products/Release-iphonesimulator/appreactnative.app'; // Fallback padrão
const iosReleaseDir = path.join(__dirname, 'ios_build/Build/Products/Release-iphonesimulator');

if (fs.existsSync(iosReleaseDir)) {
  const files = fs.readdirSync(iosReleaseDir);
  const appBundle = files.find(file => file.endsWith('.app'));
  if (appBundle) {
    iosAppPath = path.join('ios_build/Build/Products/Release-iphonesimulator', appBundle);
  }
}

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
      binaryPath: './app-react-native-production.apk',
      testBinaryPath: 'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
      build: `bun run build:apk:prod && cd android && ${gradleCmd} :app:assembleAndroidTest -DtestBuildType=release && cd ..`,
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: iosAppPath, 
      build: 'bun run build:ios:prod',
    },
  },
  devices: {
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_9a',
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