export {};

const isProd = Bun.argv.includes('--prod');
const appEnv = Bun.env.APP_ENV || (isProd ? 'production' : 'staging');

console.log(`\n🚀 Iniciando build automatizado 100% Bun-Native para: [${appEnv.toUpperCase()}]\n`);

try {
  console.log('⚙️ Passo 1: Gerando código nativo (Expo Prebuild)...');
  
  const prebuild = Bun.spawnSync(
    [process.execPath, 'x', 'cross-env', 'CI=1', `APP_ENV=${appEnv}`, 'expo', 'prebuild', '--platform', 'android', '--clean'], 
    { stdio: ['inherit', 'inherit', 'inherit'] }
  );

  if (prebuild.exitCode !== 0) {
    throw new Error('Falha crítica ao gerar o código nativo (Expo Prebuild).');
  }

  console.log('\n🩹 Passo 1.5: Aplicando patch de compatibilidade (Gradle 9+ vs foojay-resolver)...');
  const currentDir = process.cwd();
  let settingsPath = `${currentDir}/android/settings.gradle`;
  let settingsFile = Bun.file(settingsPath);
  
  if (!(await settingsFile.exists())) {
    settingsPath = `${currentDir}/android/settings.gradle.kts`;
    settingsFile = Bun.file(settingsPath);
  }

  if (await settingsFile.exists()) {
    let content = await settingsFile.text();
    content = content.replace(
      /(foojay-resolver-convention.*?version\s*\(?['"])[^'"]+(['"]\)?)/, 
      '$11.0.0$2'
    );
    await Bun.write(settingsPath, content);
    console.log(`✅ Patch aplicado com sucesso no arquivo: ${settingsPath.split('/').pop()}`);
  } else {
    console.warn('⚠️ Arquivo settings.gradle não encontrado. O patch foi ignorado.');
  }

  console.log('\n📝 Passo 2: Configurando local.properties...');
  
  let sdkDir = Bun.env.ANDROID_HOME || Bun.env.ANDROID_SDK_ROOT;

  if (!sdkDir) {
    const homeDir = Bun.env.HOME || Bun.env.USERPROFILE || '';
    if (process.platform === 'win32') {
      sdkDir = `${homeDir}/AppData/Local/Android/Sdk`;
    } else if (process.platform === 'darwin') {
      sdkDir = `${homeDir}/Library/Android/sdk`; 
    } else {
      sdkDir = `${homeDir}/Android/Sdk`; 
    }
  }

  const normalizedSdkDir = sdkDir.replace(/\\/g, '/');
  const localPropPath = `${currentDir}/android/local.properties`;
  
  await Bun.write(localPropPath, `sdk.dir=${normalizedSdkDir}\n`);
  console.log(`✅ SDK configurado com sucesso apontando para: ${normalizedSdkDir}`);

  console.log('\n🔨 Passo 3: Compilando o APK...');
  const gradleCmd = process.platform === 'win32' 
    ? `${currentDir}/android/gradlew.bat` 
    : `${currentDir}/android/gradlew`;
  
  if (process.platform !== 'win32') {
    Bun.spawnSync(['chmod', '+x', gradleCmd]);
  }

  const build = Bun.spawnSync(
    [gradleCmd, 'assembleRelease'], 
    { 
      stdio: ['inherit', 'inherit', 'inherit'],
      cwd: `${currentDir}/android` 
    }
  );

  if (build.exitCode !== 0) {
    throw new Error('Falha crítica durante a compilação do APK no Gradle.');
  }

  console.log('\n📦 Passo 4: Movendo o APK para a raiz...');
  const apkSource = `${currentDir}/android/app/build/outputs/apk/release/app-release.apk`;
  const apkDestName = `app-react-native-${appEnv}.apk`;
  const apkDest = `${currentDir}/${apkDestName}`;

  const apkFile = Bun.file(apkSource);

  if (await apkFile.exists()) {
    await Bun.write(apkDest, apkFile);
    console.log(`✅ Sucesso! O seu APK está pronto na raiz do projeto: ${apkDestName}\n`);
  } else {
    console.warn('⚠️ O build terminou, mas o APK não foi encontrado no caminho padrão.');
  }

} catch (error) {
  console.error('\n❌ O processo foi abortado devido a um erro:');
  console.error(error);
  process.exit(1);
}