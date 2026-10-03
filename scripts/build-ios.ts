import { readdir } from "node:fs/promises";

export {};

if (process.env.CI && process.env.CI !== 'true' && process.env.CI !== '1') {
  process.env.CI = 'true';
}

const isProd = Bun.argv.includes('--prod');
const appEnv = Bun.env.APP_ENV || (isProd ? 'production' : 'staging');

if (appEnv !== 'staging' && appEnv !== 'production') {
  console.error(`❌ APP_ENV inválido: ${appEnv}`);
  console.error('Valores aceitos: staging | production');
  process.exit(1);
}

console.log(`\n🚀 Iniciando build automatizado 100% Bun-Native para iOS: [${appEnv.toUpperCase()}]\n`);

try {
  console.log('⚙️ Passo 1: Gerando código nativo e instalando Pods (Expo Prebuild)...');
  
  const prebuild = Bun.spawnSync(
    [process.execPath, 'x', 'cross-env', 'CI=1', `APP_ENV=${appEnv}`, 'expo', 'prebuild', '--platform', 'ios', '--clean'], 
    { 
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        ...process.env,
        APP_ENV: appEnv,
        EXPO_PUBLIC_APP_ENV: appEnv
      }
    }
  );

  if (prebuild.exitCode !== 0) {
    throw new Error('Falha crítica ao gerar o código nativo do iOS (Expo Prebuild).');
  }

  const currentDir = process.cwd();
  const iosDir = `${currentDir}/ios`;

  console.log('\n🔗 Passo 1.5: Configurando Node para o Xcode...');

  const nodeFullPath =
    Bun.env.NODE_BINARY ||
    Bun.which('node');

  if (!nodeFullPath) {
    throw new Error('❌ Node.js não foi encontrado no ambiente.');
  }

  const nodeVersionCheck = Bun.spawnSync(
    [nodeFullPath, '--version']
  );

  if (nodeVersionCheck.exitCode !== 0) {
    throw new Error(
      `❌ Não foi possível executar o Node configurado: ${nodeFullPath}`
    );
  }

  const nodeVersion = nodeVersionCheck.stdout
    .toString()
    .trim();

  console.log(`✅ Node selecionado: ${nodeFullPath} (${nodeVersion})`);

  const bunFullPath = Bun.which('bun') || '';
  
  const nodeDir = nodeFullPath.split('/').slice(0, -1).join('/');
  const bunDir = bunFullPath.split('/').slice(0, -1).join('/');
  
  const xcodeEnvLocalPath = `${iosDir}/.xcode.env.local`;
  
  const envContent = `
export USE_WATCHMAN=false
export NODE_BINARY="${nodeFullPath}"
export PATH="${nodeDir}:${bunDir}:$PATH:/opt/homebrew/bin:/usr/local/bin"
export APP_ENV="${appEnv}"
export EXPO_PUBLIC_APP_ENV="${appEnv}" 
export CI="true"
  `;
  
  await Bun.write(xcodeEnvLocalPath, envContent.trim() + '\n');
  console.log(`✅ Xcode mapeado! Node ${nodeVersion} localizado em: ${nodeFullPath}`);

  const files = await readdir(iosDir);
  const workspaceName = files.find(file => file.endsWith('.xcworkspace'));

  if (!workspaceName) {
    throw new Error('Não foi possível localizar o arquivo .xcworkspace dentro do diretório /ios.');
  }

  const schemeName = workspaceName.replace('.xcworkspace', '');
  console.log(`✅ Projeto Xcode localizado: ${workspaceName} (Scheme: ${schemeName})`);

  console.log('\n🔨 Passo 2: Compilando o aplicativo via xcodebuild (Modo Release)...');

  console.log('\n===== XCODE NODE ENV =====');
  console.log(`NODE_BINARY=${nodeFullPath}`);
  console.log(`PATH=${process.env.PATH ?? ''}`);

  console.log('\n===== .xcode.env.local =====');
  console.log(await Bun.file(xcodeEnvLocalPath).text());

  const xcodeLogPath = `${currentDir}/xcodebuild-ios.log`;

  const xcodeCommand = [
    'set -o pipefail',
    `mkdir -p "${currentDir}/ios_build"`,
    '&&',
    'xcodebuild',
    `-workspace "${iosDir}/${workspaceName}"`,
    `-scheme "${schemeName}"`,
    '-configuration Release',
    '-sdk iphonesimulator',
    `-derivedDataPath "${currentDir}/ios_build"`,
    '2>&1',
    `| tee "${xcodeLogPath}"`,
  ].join(' ');

  const xcodebuild = Bun.spawnSync(
    ['bash', '-c', xcodeCommand],
    {
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        ...process.env,
        NODE_BINARY: nodeFullPath,
        PATH: `${nodeDir}:${bunDir}:${process.env.PATH ?? ''}`,
        APP_ENV: appEnv,
        EXPO_PUBLIC_APP_ENV: appEnv,
        CI: 'true',
      },
    }
  );

  if (xcodebuild.exitCode !== 0) {
    console.error('\n===== XCODE FAILURE DIAGNOSTICS =====');

    Bun.spawnSync(
      [
        'bash',
        '-c',
        `
          if [ -f "${xcodeLogPath}" ]; then
            echo
            echo "===== RELEVANT ERRORS ====="

            grep -n -i -E 'error:|commanderror|exception|failed|cannot|not found|enoent|expo-updates|exupdates|node:|NODE_BINARY' \
              "${xcodeLogPath}" | tail -n 160 || true

            echo
            echo "===== EXPO-UPDATES CONTEXT ====="

            grep -n -i -B 20 -A 40 \
              -E 'Generate updates resources|expo-updates|EXUpdates' \
              "${xcodeLogPath}" | tail -n 240 || true

            echo
            echo "===== LAST 300 LINES ====="

            tail -n 300 "${xcodeLogPath}"
          else
            echo "XCODE_LOG_NOT_FOUND=${xcodeLogPath}"
          fi
        `,
      ],
      {
        stdout: 'inherit',
        stderr: 'inherit',
      }
    );

    throw new Error(
      `Falha crítica durante a compilação nativa no xcodebuild. Log: ${xcodeLogPath}`
    );
  }

  console.log('\n📦 Passo 3: Localizando o binário e compactando para distribuição...');
  
  const releaseDir = `${currentDir}/ios_build/Build/Products/Release-iphonesimulator`;
  let appDirName: string | undefined;

  try {
    const releaseFiles = await readdir(releaseDir);
    appDirName = releaseFiles.find(file => file.endsWith('.app'));
  } catch (error) {
    throw new Error(
      `❌ Diretório de compilação não encontrado: ${releaseDir}`,
      { cause: error },
    );
  }

  if (!appDirName) {
      throw new Error(`❌ Nenhum pacote .app foi gerado dentro de: ${releaseDir}`);
  }
  
  console.log(`🎯 Pacote .app localizado com sucesso: ${appDirName}`);
  console.log('🤐 Compactando o pacote em um arquivo .zip seguro para a Apple...');
  
  const artifactBasename = Bun.env.ARTIFACT_BASENAME || "app-react-native";
  const zipDestName = `${artifactBasename}-ios-${appEnv}.zip`;
  const zipDestPath = `${currentDir}/${zipDestName}`;

  if (await Bun.file(zipDestPath).exists()) {
    const removeOldZip = Bun.spawnSync(['rm', '-f', zipDestPath]);

    if (removeOldZip.exitCode !== 0) {
      throw new Error(`Falha ao remover ZIP anterior: ${zipDestPath}`);
    }
  }

  const zipProcess = Bun.spawnSync(
    ['zip', '-r', zipDestPath, appDirName],
    { cwd: releaseDir }
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
