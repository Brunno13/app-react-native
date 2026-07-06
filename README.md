# 📱 App React Native (Expo + Bun)

Aplicativo mobile multiplataforma (Android e iOS) construído com React Native e Expo, utilizando o Bun para máxima performance no gerenciamento de pacotes e scripts. O projeto adota a arquitetura **Feature-Sliced Design (FSD)** e o modelo **Offline-First**, garantindo navegação fluida sem internet e segurança total dos dados no dispositivo.

### 🚀 Recursos Principais
* **Autenticação e Segurança:** Login via `better-auth`, armazenamento nativo criptografado (`Secure Store`) e bloqueio de tela por biometria (Face ID / Touch ID).
* **Arquitetura (FSD):** Organização modular focada no domínio do negócio, com regras estritas que blindam o código contra acoplamento indevido.
* **Persistência Offline:** Banco de dados local ultrarrápido utilizando `Expo SQLite` em conjunto com o `Drizzle ORM`.
* **Qualidade e Governança:** ESLint integrado à pipeline (Fail Fast) para garantir a integridade da arquitetura antes de qualquer deploy.
* **Testes Automatizados:** Cobertura de ponta a ponta. Testes unitários com `Jest` e testes visuais de fluxo real (E2E) com `Detox`, rodando de forma autônoma em emuladores Android (incluindo responsividade em tablets) e simuladores iOS.
* **Conectividade Inteligente:** Monitoramento de rede em tempo real com alertas visuais amigáveis e controle de *timeout* em chamadas de API.
* **Infraestrutura e CI/CD:** Ambientes isolados (Staging e Produção), builds nativos multiplataforma automatizados no Woodpecker CI e atualizações instantâneas Over-The-Air (EAS Update).

---

## 🗺️ Roadmap do Projeto

### ✅ Concluído 
- [x] **Setup Inicial:** Inicialização com React Native, Expo e Bun.
- [x] **Autenticação:** Integração do cliente `@better-auth/expo`.
- [x] **Arquitetura:** Organização no padrão Feature-Sliced Design (FSD).
- [x] **Gestão de Ambientes:** Flavors dinâmicos (Staging / Produção).
- [x] **Tooling:** Scripts cross-platform para build automatizado.
- [x] **CI/CD:** Pipeline configurada no Woodpecker.
- [x] **Atualizações (OTA):** Configuração do `expo-updates` (EAS Update) para envio de correções.
- [x] **Navegação:** Migração para Expo Router.
- [x] **Tipagem e Formulários:** Implementação de `zod` e `react-hook-form`.
- [x] **Resiliência e Dicionário:** Tratamento de erros com `react-error-boundary` e internacionalização com `i18next`.
- [x] **Injeção de Dependências:** Camada de Providers utilizando Context API.
- [x] **Armazenamento Offline:** Banco local (`Expo SQLite` e `Drizzle ORM`) combinado com cofres nativos (`expo-secure-store`).
- [x] **Biometria:** Implementação de tela de bloqueio utilizando `expo-local-authentication` atrelada às configurações do perfil do usuário.
- [x] **Darkmode:** Implementação de `darkmode` onde o usuário poderá escolher entre Light, Dark e Auto (configurações do sistema operacional).
- [x] **Governança de Código:** Configuração nativa de ESLint com bloqueio de fronteiras para blindar a arquitetura FSD contra acoplamento indevido, integrada às pipelines (Fail Fast).
- [x] **Testes Unitários:** Cobertura de testes utilizando `Jest` e `React Native Testing Library`.
- [x] **Testes E2E:** Implementação do `Detox` multiplataforma (Android/iOS) para testes automatizados de fluxos de usuário, com suporte nativo a múltiplos formatos de tela (celulares e tablets).

### ⏳ Próximos Passos
- [ ] **Documentação de UI:** Configuração do `Storybook` para mapear e testar componentes da camada `shared/ui`.
- [ ] **Observabilidade:** Integração do `Firebase Crashlytics` para rastreamento de falhas em produção.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React Native + Expo (SDK 56)
* **Linguagem:** TypeScript
* **Gerenciador de Pacotes:** Bun
* **Navegação:** Expo Router
* **Autenticação:** Better Auth (`@better-auth/expo`)
* **Banco de Dados & ORM:** Expo SQLite + Drizzle ORM
* **Segurança e Biometria:** Expo Secure Store + Expo Local Authentication
* **Testes Automatizados:** Jest + React Native Testing Library (Unitários e Integração) + Detox (E2E Multiplataforma)
* **Rede e Conectividade:** NetInfo (`@react-native-community/netinfo`)
* **Estado Global e Injeção:** Context API
* **Formulários e Validação:** React Hook Form + Zod
* **Resiliência e Internacionalização:** React Error Boundary + i18next
* **Atualizações (OTA):** Expo Updates (EAS)
* **Arquitetura & Qualidade:** Feature-Sliced Design (FSD) + ESLint (FSD boundaries)
* **CI/CD:** Woodpecker CI 

---

## 🏗️ Arquitetura do Projeto

O projeto segue rigorosamente o padrão **Feature-Sliced Design (FSD)**, focando em alta coesão, baixo acoplamento e escalabilidade previsível. A separação é feita em camadas estruturadas, indo da infraestrutura base e global até as regras de negócio puras e o roteamento físico.

A estrutura principal de pastas dentro de `src/` está organizada da seguinte forma:

```text
/ (Raiz do Projeto)
├── e2e/                  # Testes automatizados de ponta a ponta (End-to-End) com Detox
│   ├── helpers/          # Funções auxiliares e fluxos reutilizáveis (authHelpers.js)
│   └── *.test.js         # Cenários de teste visuais e de fluxo do usuário (authFlow.test.js)
│
└── src/                  # Código-fonte principal da aplicação
    ├── __tests__/        # Refúgio de testes estritamente para contornar o File-Based Routing do Expo Router
    │   └── app/          # Testes de integração e roteamento das telas (isolados da pasta src/app)
    │
    ├── shared/           # Infraestrutura corporativa, utilitários e configurações globais
    │   ├── api/          # Cliente HTTP centralizado (apiClient.ts, apiClient.test.ts)
    │   ├── config/       # Configurações do ecossistema do app (ex: i18n/locales)
    │   ├── db/           # Motor Offline-First (Cliente Drizzle, migrações e repositórios)
    │   ├── lib/          # Inicialização e pontes de bibliotecas externas
    │   ├── providers/    # Provedores globais de contexto (AppProvider.tsx, AppProvider.test.tsx)
    │   └── ui/           # Design System atomizado (Toast.tsx, Toast.test.tsx)
    │
    ├── features/         # Fatias de negócio independentes, acopladas a domínios comerciais específicos
    │   ├── auth/         # Domínio de Autenticação, Segurança e Sessão Híbrida
    │   │   ├── index.ts  # Public API (Barrel File)
    │   │   ├── api/      # Isolamento de chamadas de rede
    │   │   ├── hooks/    # Lógica de estados e ações (useAuth.ts, useAuth.test.ts)
    │   │   ├── services/ # Regras de negócio complexas
    │   │   ├── ui/       # Componentes visuais co-localizados com seus testes (LoginForm.tsx, LoginForm.test.tsx)
    │   │   └── domain/   # Schemas de validação de dados em tempo de execução com Zod
    │   └── profile/      # Domínio de Perfil de Usuário e Configurações locais
    │       ├── index.ts  # Public API (Barrel File)
    │       ├── services/ # Manipulação de preferências persistidas (preferenceService.ts, preferenceService.test.ts)
    │       └── ui/       # Formulários e componentes do domínio de perfil (EditProfileForm.tsx, EditProfileForm.test.tsx)
    │
    └── app/              # Ponto de entrada, roteamento nativo e orquestração visual (Expo Router)
        ├── (auth)/       # Fluxo público de acesso (login.tsx, signup.tsx, forgot-password.tsx)
        ├── (main)/       # Fluxo protegido por sessão e biometria
        │   ├── (tabs)/   # Navegação inferior por abas (home.tsx, profile.tsx)
        │   ├── edit-profile.tsx 
        │   └── security.tsx
        ├── _providers/   # Composição limpa de provedores locais e globais
        └── _layout.tsx   # Inicialização estrutural do app (Injeção da árvore de Providers e Error Boundary)
```

### 📏 Diretrizes de Arquitetura

Para manter o código limpo, escalável e livre de acoplamento, seguimos 3 regras básicas:

**1. Fluxo de Dependências (De cima para baixo)**
* **`app`** ➔ Pode importar de `features` e `shared`.
* **`features`** ➔ Pode importar apenas de `shared`.
* **`shared`** ➔ Componentes agnósticos. Jamais deve importar de `features` ou `app`.

**2. Encapsulamento de Features (Barrel Files)**
* É **estritamente proibido** acessar arquivos internos de uma feature por fora dela. Nosso linter (CI/CD) bloqueia quebras dessa regra automaticamente.
* ❌ *Errado:* `import { LoginForm } from '@/features/auth/ui/LoginForm'`
* ✅ *Correto:* `import { LoginForm } from '@/features/auth'`

**3. Persistência Híbrida Inteligente**
* **Cache e Modo Offline:** Dados de interface e preferências ficam no banco relacional (`Expo SQLite` + `Drizzle ORM`).
* **Segurança:** Tokens, chaves e dados sensíveis são guardados na criptografia nativa do aparelho (`Secure Store`).

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

A pipeline configurada no Woodpecker CI (`.woodpecker/release.yml`) automatiza a geração de pacotes (Android e iOS), o envio de atualizações sem fio (OTA) e a sincronização do repositório.

**Fluxo da Pipeline de Release:**
1. **Trigger:** A criação de uma Tag (ex: `v1.0.5`) no Gitea inicia a pipeline.

2. **Agente Nativo:** A execução ocorre em um agente macOS (`darwin/arm64`) para utilizar o Xcode e o Apple Silicon.

3. **Compilação Dupla:**
   * Injeção da variável `APP_ENV=production`.
   * **Android:** Execução do `expo prebuild` e empacotamento via Gradle gerando o `.apk`.
   * **iOS:** Instalação dos Pods e compilação via `xcodebuild`, gerando um `.zip`.

4. **Atualização OTA (Over-the-Air):** O bundle JavaScript é sincronizado com a nuvem do Expo (`eas update`), enviando correções instantâneas de lógica e interface para os usuários sem necessidade de aprovação nas lojas.

5. **Release Interna:** O Woodpecker gera o changelog, cria a versão no servidor Gitea e anexa os artefatos compilados.

6. **Espelhamento (GitHub):** O código-fonte associado à Tag é enviado para o GitHub, onde uma Release pública idêntica é criada com o `.apk` e o `.zip`.

---

## 🔐 Segurança e Tráfego Local

Em Staging, o aplicativo permite tráfego HTTP em texto claro (`usesCleartextTraffic: true`) para comunicação com a API local. A versão de produção compila exigindo conexões HTTPS.

---