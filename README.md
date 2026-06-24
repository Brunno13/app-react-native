# 📱 App React Native (App Bun)

Aplicativo mobile multiplataforma construído com React Native e Expo, utilizando **Bun** como gerenciador de pacotes. O projeto conta com autenticação via `better-auth`, gerenciamento dinâmico de ambientes e pipeline de CI/CD para geração de releases.

---

## 🗺️ Roadmap do Projeto

### ✅ Concluído
- [x] **Setup Inicial:** Inicialização com React Native, Expo e Bun.
- [x] **Autenticação:** Integração do cliente `@better-auth/expo`.
- [x] **Arquitetura:** Organização no padrão Feature-Sliced Design (FSD).
- [x] **Gestão de Ambientes:** Flavors dinâmicos (Staging / Produção).
- [x] **Tooling:** Scripts cross-platform para build automatizado.
- [x] **CI/CD:** Pipeline configurada no Woodpecker (Geração de Release, pacotes e sincronização Gitea/GitHub).

### ⏳ Próximos Passos
- [ ] **Tipagem e Formulários:** Implementação de `zod` e `react-hook-form` para validação nas features.
- [ ] **Armazenamento Offline:** Configuração do banco de dados local com `Expo SQLite` e `Drizzle ORM`.
- [ ] **Injeção de Dependências:** Estabelecimento da camada de `Providers` baseada em Context API para distribuição de estados/serviços.
- [ ] **Resiliência e Dicionário:** Integração do `react-error-boundary` para tratamento de erros e `i18next` para internacionalização.
- [ ] **Documentação de UI:** Configuração do `Storybook` para mapear e testar componentes da camada `shared/ui`.
- [ ] **Testes Unitários:** Cobertura de testes utilizando `Jest` e `React Native Testing Library`.
- [ ] **Testes E2E:** Implementação do `Maestro` para testes automatizados de fluxos de usuário e interface end-to-end.
- [ ] **Observabilidade:** Integração do `Firebase Crashlytics` para rastreamento de falhas e monitoramento em produção.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React Native + Expo (SDK 56)
* **Linguagem:** TypeScript
* **Gerenciador de Pacotes:** Bun
* **Autenticação:** Better Auth (`@better-auth/expo`)
* **Arquitetura:** Feature-Sliced Design (FSD)
* **CI/CD:** Woodpecker CI

---

## 🏗️ Arquitetura do Projeto

O projeto segue o padrão **Feature-Sliced Design (FSD)**, focando em modularidade e escalabilidade. A separação ocorre da base (módulos globais) para o topo (telas completas).

A estrutura principal reside na pasta `src/`:

```text
src/
├── shared/     # Código compartilhado e configurações
│   ├── lib/    # Inicialização de bibliotecas de terceiros (ex: auth.ts)
│   └── ui/     # Componentes visuais globais (Botões, Inputs padrão)
│
├── features/   # Funcionalidades e regras de negócio fatiadas
│   └── auth/   # Domínio de Autenticação
│       ├── hooks/  # Lógica e chamadas de API (useAuth.ts)
│       └── ui/     # Fragmentos de interface da regra (LoginForm.tsx)
│
├── screens/    # Telas completas que compõem as features
│   └──         # Ex: HomeScreen, AuthScreen
│
└── app/        # Ponto de entrada
                # Provedores de contexto globais, temas, etc.
```

### Diretriz de Importação::

* **O fluxo é de cima para baixo.** Telas (screens) importam funcionalidades (features), que por sua vez podem importar módulos globais (shared). O caminho inverso não é permitido.

---

## 🌍 Ambientes (Flavors Dinâmicos)

O aplicativo utiliza o app.config.ts em conjunto com o cross-env para alternar entre ambientes de Staging e Produção dinamicamente, sem a necessidade de flavors nativos do Android/iOS.

* **Staging:** O app se chama App Bun (Staging), utiliza o pacote com.brunno.app.staging e aponta para a API local.

* **Produção:** O app se chama App Bun, utiliza o pacote com.brunno.app e aponta para o servidor com suporte a tráfego HTTPS.

---

## 🚀 Como Rodar e Buildar o Projeto Localmente

### Pré-requisitos
* [Bun](https://bun.sh/) instalado.
* **Para Android:** Android Studio (Emulador) configurado ou dispositivo físico com Expo Go.
* **Para iOS (Apenas macOS):** Xcode instalado, Command Line Tools configurado, CocoaPods instalado (brew install cocoapods) e o Simulador de iOS ativo.

### 💻 Modo de Desenvolvimento (Live Reload)

1. **Instale as dependências:**
    ```bash
    bun install
    ```

2. **Inicie o servidor de desenvolvimento via Expo Go (Ambiente Staging):**

    ```bash
    bun run android  # Abre no Emulador Android
    # ou
    bun run ios      # Abre no Simulador iOS via Expo Go
    # ou
    bun start        # Abre o painel geral do Metro Bundler
    ```

3. **Para testar no Expo Go com configurações de Produção:**

    ```bash
    bun run android:prod
    # ou
    bun run ios:prod
    ```

4. **Para rodar com compilação nativa local (Dev Client):**
    Caso o projeto utilize bibliotecas nativas geradas pelo Prebuild, compile diretamente no emulador/simulador:

    ```bash
    bun run run:android  # Compila e roda nativamente no Android
    # ou
    bun run run:ios      # Executa os Pods e compila nativamente no Simulador Apple
    ```

### 📦 Gerando os Binários Localmente
Os scripts automatizados detectam o ambiente e configuram as variáveis locais de build.

#### 🤖 Android (Geração de APK via Gradle)
O script configura o caminho do Android SDK e as propriedades de memória da JVM.

* **Gerar APK de Staging (Permite HTTP local):**
    
    ```bash
    bun run build:apk
    ```
* **Gerar APK de Produção (Exige HTTPS seguro):**
    
    ```bash
    bun run build:apk:prod
    ```
* **Resultado:** Os arquivos ficarão na raiz do projeto como `app-react-native-staging.apk` ou `app-react-native-production.apk`.

#### 🍎 iOS (Geração de Pacote via xcodebuild)
*Requer macOS*. O script executa o pré-build, instala as dependências da Apple e compila o projeto em modo Release.

* **Gerar pacote iOS de Staging:**
    ```bash
    bun run build:ios
    ```
* **Gerar pacote iOS de Produção:**
    ```bash
    bun run build:ios:prod
    ```
* **Resultado:** O pacote `.app` para simuladores será exportado compactado na raiz do projeto como `app-react-native-ios-staging.zip` ou `app-react-native-ios-production.zip`.

---

## 📦 CI/CD, Automação Multiplataforma e Espelhamento

A pipeline configurada no Woodpecker CI (`.woodpecker/release.yml`) automatiza a geração de pacotes (Android e iOS) e a sincronização do repositório.

**Fluxo da Pipeline de Release:**
1. **Trigger:** A criação de uma Tag (ex: `v1.0.5`) no Gitea inicia a pipeline.
2. **Agente Nativo:** A execução ocorre em um agente macOS (`darwin/arm64`) para utilizar o Xcode e o Apple Silicon.
3. **Compilação Dupla:**
   * Injeção da variável `APP_ENV=production`.
   * **Android:** Execução do `expo prebuild` e empacotamento via Gradle.
   * **iOS:** Instalação dos Pods e compilação via `xcodebuild`, gerando um `.zip`.
4. **Release Interna:** O Woodpecker gera o changelog, cria a versão no Gitea e anexa os arquivos compilados.
5. **Espelhamento (GitHub):** O código-fonte associado à Tag é enviado para o GitHub, onde uma Release idêntica é criada com o `.apk` e o `.zip`.

---

## 🔐 Segurança e Tráfego Local

Em Staging, o aplicativo permite tráfego HTTP em texto claro (`usesCleartextTraffic: true`) para comunicação com a API local. A versão de produção compila exigindo conexões HTTPS.

---