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

  // ---------------------------------------------------------------------
  // NOVO PASSO: Correção automática do Bug do Gradle 9.0+ (IBM_SEMERU)
  // ---------------------------------------------------------------------
  console.log('\n🩹 Passo 1.5: Aplicando patch de compatibilidade agressivo...');
  const currentDir = process.cwd();
  const settingsPaths = [
    `${currentDir}/android/settings.gradle`,
    `${currentDir}/android/settings.gradle.kts`
  ];

  let patchApplied = false;

  for (const settingsPath of settingsPaths) {
    const settingsFile = Bun.file(settingsPath);
    if (await settingsFile.exists()) {
      let content = await settingsFile.text();
      const originalContent = content;
      
      content = content.replace(
        /(id\s*\(?['"]org\.gradle\.toolchains\.foojay-resolver-convention['"]\)?\s*version\s*\(?['"]).*?(['"]\)?)/g,
        '$10.8.0$2'
      );

      if (content !== originalContent) {
        await Bun.write(settingsPath, content);
        console.log(`✅ Patch aplicado com sucesso no arquivo: ${settingsPath.split('/').pop()}`);
        patchApplied = true;
        break;
      }
    }
  }

  if (!patchApplied) {
    console.warn('⚠️ O patch não encontrou o plugin foojay-resolver para corrigir. O build pode falhar.');
  }
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // CORREÇÃO: Forçar Gradle a usar o sistema local e ignorar vendors específicos
  // ---------------------------------------------------------------------
  console.log('\n🩹 Passo 1.6: Blindando Gradle contra erros de Toolchain...');
  const gradlePropsPath = `${currentDir}/android/gradle.properties`;
  const gradlePropsContent = `
# Ignorar auto-detecção de vendors que causa erro com Gradle 9+
org.gradle.java.installations.auto-detect=false
# Usar o Java instalado no container
org.gradle.java.home=${process.env.JAVA_HOME || '/usr/lib/jvm/default-java'}
`;
  await Bun.write(gradlePropsPath, gradlePropsContent);
  // ---------------------------------------------------------------------

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