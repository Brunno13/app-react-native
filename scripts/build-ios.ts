import { readdir } from "node:fs/promises";

export {};

if (process.env.CI && process.env.CI !== 'true' && process.env.CI !== '1') {
  process.env.CI = 'true';
}

const isProd = Bun.argv.includes('--prod');
const appEnv = Bun.env.APP_ENV || (isProd ? 'production' : 'staging');

console.log(`\n🚀 Iniciando build automatizado 100% Bun-Native para iOS: [${appEnv.toUpperCase()}]\n`);

try {
  console.log('⚙️ Passo 1: Gerando código nativo e instalando Pods (Expo Prebuild)...');
  
  const prebuild = Bun.spawnSync(
    [process.execPath, 'x', 'cross-env', 'CI=1', `APP_ENV=${appEnv}`, 'expo', 'prebuild', '--platform', 'ios', '--clean'], 
    { stdio: ['inherit', 'inherit', 'inherit'] as any }
  );

  if (prebuild.exitCode !== 0) {
    throw new Error('Falha crítica ao gerar o código nativo do iOS (Expo Prebuild).');
  }

  const currentDir = process.cwd();
  const iosDir = `${currentDir}/ios`;

  console.log('\n🔗 Passo 1.5: Bypass Supremo para NVM e Variáveis no Xcode...');
  
  const nvmCheck = Bun.spawnSync([
    'bash', '-c', 
    'export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"; nvm use 21 > /dev/null 2>&1; which node'
  ]);
  
  const nodeFullPath = nvmCheck.stdout.toString().trim() || Bun.which('node');

  if (!nodeFullPath) {
    throw new Error('❌ Node.js não foi encontrado nem no PATH e nem no NVM.');
  }

  const bunFullPath = Bun.which('bun') || '';
  
  const nodeDir = nodeFullPath.split('/').slice(0, -1).join('/');
  const bunDir = bunFullPath.split('/').slice(0, -1).join('/');
  
  const xcodeEnvLocalPath = `${iosDir}/.xcode.env.local`;
  
  const envContent = `
export USE_WATCHMAN=false
export NODE_BINARY="${nodeFullPath}"
export PATH="${nodeDir}:${bunDir}:$PATH:/opt/homebrew/bin:/usr/local/bin"
export APP_ENV="${appEnv}"
export CI="true"
  `;
  
  await Bun.write(xcodeEnvLocalPath, envContent.trim() + '\n');
  console.log(`✅ Xcode mapeado! Node 21 localizado em: ${nodeFullPath}`);

  // Localiza dinamicamente o arquivo .xcworkspace gerado pelo Expo
  const files = await readdir(iosDir);
  const workspaceName = files.find(file => file.endsWith('.xcworkspace'));

  if (!workspaceName) {
    throw new Error('Não foi possível localizar o arquivo .xcworkspace dentro do diretório /ios.');
  }

  const schemeName = workspaceName.replace('.xcworkspace', '');
  console.log(`✅ Projeto Xcode localizado: ${workspaceName} (Scheme: ${schemeName})`);

  console.log('\n🔨 Passo 2: Compilando o aplicativo via xcodebuild (Modo Release)...');
  
  const xcodebuild = Bun.spawnSync(
    [
      'xcodebuild',
      '-workspace', `${iosDir}/${workspaceName}`,
      '-scheme', schemeName,
      '-configuration', 'Release',
      '-sdk', 'iphonesimulator',
      '-derivedDataPath', `${currentDir}/ios_build`
    ],
    { stdio: ['inherit', 'inherit', 'inherit'] as any }
  );

  if (xcodebuild.exitCode !== 0) {
    throw new Error('Falha crítica durante a compilação nativa no xcodebuild.');
  }

  console.log('\n📦 Passo 3: Localizando o binário e compactando para distribuição...');
  
  const appSourcePath = `${currentDir}/ios_build/Build/Products/Release-iphonesimulator/${schemeName}.app`;
  const zipDestName = `app-react-native-ios-${appEnv}.zip`;

  const appFile = Bun.file(appSourcePath);
  
  if (!(await appFile.exists())) {
      throw new Error(`Pacote .app não encontrado no caminho esperado: ${appSourcePath}`);
  }
  
  console.log('🤐 Compactando o arquivo .app em um arquivo .zip...');
  const zipProcess = Bun.spawnSync(
    ['zip', '-r', `../${zipDestName}`, '.'],
    { cwd: appSourcePath }
  );

  if (zipProcess.exitCode !== 0) {
    throw new Error('Falha ao compactar o aplicativo .app.');
  }

  console.log(`\n✅ Sucesso! O seu pacote iOS está pronto na raiz do projeto: ${zipDestName}\n`);

} catch (error) {
  console.error('\n❌ O processo foi abortado devido a um erro:');
  console.error(error);
  process.exit(1);
}