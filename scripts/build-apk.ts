export {};

if (process.env.CI && process.env.CI !== 'true' && process.env.CI !== '1') {
  process.env.CI = 'true';
}

const isProd = Bun.argv.includes('--prod');
const appEnv = Bun.env.APP_ENV || (isProd ? 'production' : 'staging');

console.log(`\n🚀 Iniciando build automatizado 100% Bun-Native para: [${appEnv.toUpperCase()}]\n`);

try {
  console.log('⚙️ Passo 1: Gerando código nativo (Expo Prebuild)...');
  
  const prebuild = Bun.spawnSync(
    [process.execPath, 'x', 'cross-env', 'CI=1', `APP_ENV=${appEnv}`, 'expo', 'prebuild', '--platform', 'android', '--clean'], 
    { stdio: ['inherit', 'inherit', 'inherit'] as any }
  );

  if (prebuild.exitCode !== 0) {
    throw new Error('Falha crítica ao gerar o código nativo (Expo Prebuild).');
  }

  const currentDir = process.cwd();

  console.log('\n📝 Passo 2: Configurando SDK e Otimizando RAM para o Mac M1 (8GB)...');
  
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

  const gradlePropsPath = `${currentDir}/android/gradle.properties`;
  let gradleProps = '';
  const gradlePropsFile = Bun.file(gradlePropsPath);
  if (await gradlePropsFile.exists()) {
    gradleProps = await gradlePropsFile.text();
  }
  
  gradleProps += '\n# Limites de Memoria aplicados automaticamente\n';
  gradleProps += 'org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m\n';
  gradleProps += 'org.gradle.workers.max=2\n';
  await Bun.write(gradlePropsPath, gradleProps);
  console.log(`✅ SDK configurado e limites de memória ativados (Workers: 2, RAM: 2GB).`);

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
      stdio: ['inherit', 'inherit', 'inherit'] as any,
      cwd: `${currentDir}/android`,
      env: {
        ...process.env,
        CMAKE_BUILD_PARALLEL_LEVEL: '2' 
      }
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