import { readdir } from "node:fs/promises";

export {};

// Neutraliza o comportamento do Woodpecker que quebra o validador do Expo CLI
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

  console.log('\n🔗 Passo 1.5: Configurando o mapa do Node para o terminal interno do Xcode...');
  
  // Descobre o caminho absoluto do Node ou Bun na sua máquina
  const nodePath = Bun.spawnSync(['which', 'node']).stdout.toString().trim();
  const bunPath = Bun.spawnSync(['which', 'bun']).stdout.toString().trim();
  const jsRuntime = nodePath || bunPath;

  if (jsRuntime) {
    // Injeta a rota cravada no arquivo que o Xcode lê antes de compilar o JS
    const xcodeEnvLocalPath = `${iosDir}/.xcode.env.local`;
    await Bun.write(xcodeEnvLocalPath, `export NODE_BINARY="${jsRuntime}"\n`);
    console.log(`✅ NODE_BINARY cravado com sucesso: ${jsRuntime}`);
  } else {
    console.warn('⚠️ Aviso: Não foi possível localizar o binário do Node ou Bun no PATH.');
  }

  // Localiza dinamicamente o arquivo .xcworkspace gerado pelo Expo
  const files = await readdir(iosDir);
  const workspaceName = files.find(file => file.endsWith('.xcworkspace'));

  if (!workspaceName) {
    throw new Error('Não foi possível localizar o arquivo .xcworkspace dentro do diretório /ios.');
  }

  const schemeName = workspaceName.replace('.xcworkspace', '');
  console.log(`\n✅ Projeto Xcode localizado: ${workspaceName} (Scheme: ${schemeName})`);

  console.log('\n🔨 Passo 2: Compilando o aplicativo via xcodebuild (Modo Release)...');
  
  // Executa a compilação nativa otimizada para a arquitetura ARM64
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
  
  // Rota padrão do binário gerado pelo derivedDataPath do Xcode
  const appSourcePath = `${currentDir}/ios_build/Build/Products/Release-iphonesimulator/${schemeName}.app`;
  const zipDestName = `app-react-native-ios-${appEnv}.zip`;

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