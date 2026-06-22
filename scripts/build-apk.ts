import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

// 1. Define o ambiente (Staging ou Production)
const isProd = process.argv.includes('--prod');
const appEnv = process.env.APP_ENV || (isProd ? 'production' : 'staging');

console.log(`\n🚀 Iniciando build automatizado para o ambiente: [${appEnv.toUpperCase()}]\n`);

try {
  // 2. Executa o Expo Prebuild
  console.log('⚙️ Passo 1: Gerando código nativo (Expo Prebuild)...');
  execSync(`bunx cross-env APP_ENV=${appEnv} expo prebuild --platform android --clean`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // 3. Configura o local.properties de forma dinâmica
  console.log('\n📝 Passo 2: Configurando local.properties...');
  
  // Tenta pegar da variável de ambiente primeiro (Comum em ambientes CI como o Woodpecker)
  let sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  // Se não existir na variável, resolve dinamicamente pela Home do usuário
  if (!sdkDir) {
    const home = os.homedir();
    const platform = os.platform();

    if (platform === 'win32') {
      sdkDir = path.join(home, 'AppData', 'Local', 'Android', 'Sdk');
    } else if (platform === 'darwin') {
      sdkDir = path.join(home, 'Library', 'Android', 'sdk');
    } else {
      sdkDir = path.join(home, 'Android', 'Sdk'); // Linux fallback
    }
  }

  // O Gradle exige barras normais (/) mesmo no Windows, então substituímos as barras invertidas
  const normalizedSdkDir = sdkDir.replace(/\\/g, '/');
  const localPropPath = path.join(process.cwd(), 'android', 'local.properties');
  
  fs.writeFileSync(localPropPath, `sdk.dir=${normalizedSdkDir}\n`);
  console.log(`✅ SDK configurado com sucesso apontando para: ${normalizedSdkDir}`);

  // 4. Executa o build do Gradle
  console.log('\n🔨 Passo 3: Compilando o APK (Isso levará alguns minutos)...');
  
  // No Windows usamos .bat, no Unix usamos ./
  const isWin = os.platform() === 'win32';
  const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';
  
  execSync(`${gradleCmd} assembleRelease`, { 
    stdio: 'inherit', 
    cwd: path.join(process.cwd(), 'android') 
  });

  // 5. Move o APK gerado para a raiz do projeto (Facilita para o Woodpecker)
  console.log('\n📦 Passo 4: Movendo o APK para a raiz...');
  const apkSource = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  const apkDestName = `app-react-native-${appEnv}.apk`;
  const apkDest = path.join(process.cwd(), apkDestName);

  if (fs.existsSync(apkSource)) {
    // Sobrescreve se já existir
    if (fs.existsSync(apkDest)) fs.unlinkSync(apkDest); 
    fs.copyFileSync(apkSource, apkDest);
    console.log(`✅ Sucesso! O seu APK está pronto na raiz do projeto: ${apkDestName}\n`);
  } else {
    console.warn('⚠️ O build terminou, mas o APK não foi encontrado no caminho padrão.');
  }

} catch (error) {
  console.error('\n❌ Erro durante o processo de build:');
  console.error(error);
  process.exit(1);
}