# 📱 App React Native (Expo + Bun)

Aplicativo mobile multiplataforma construído com React Native e Expo, utilizando o Bun como gerenciador de pacotes. 

O projeto foi estruturado seguindo a arquitetura Feature-Sliced Design (FSD) e o modelo Offline-First, com foco no funcionamento sem conexão e na segurança dos dados armazenados no dispositivo.

### 🚀 Recursos Principais
* **Autenticação e Segurança:** Integração com `better-auth`, armazenamento de tokens criptografados (`Secure Store`) e bloqueio do aplicativo por biometria nativa (Face ID / Touch ID).
* **Arquitetura (FSD):** Código modular organizado por domínios de negócio, com dependências controladas através de pontos de exportação (*Barrel Files*).
* **Persistência de Dados:** Banco de dados local `Expo SQLite` gerenciado com `Drizzle ORM` para cache de interface e modo offline.
* **Rede e Conectividade:** Monitoramento de rede com banner de aviso visual e limite de tempo de requisição (*timeout*) configurado.
* **Cliente HTTP:** Abstração sobre a API `fetch` para envio automático de tokens e interceptação centralizada de sessões expiradas (status 401).
* **Infraestrutura:** Separação de ambientes (Staging/Produção), atualizações assíncronas via código (EAS Update) e esteira de CI/CD configurada no Woodpecker CI.

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

### ⏳ Próximos Passos
- [ ] **Testes Unitários:** Cobertura de testes utilizando `Jest` e `React Native Testing Library`.
- [ ] **Testes E2E:** Implementação do `Detox` para testes automatizados de fluxos de usuário.
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
* **Rede e Conectividade:** NetInfo (`@react-native-community/netinfo`)
* **Estado Global e Injeção:** Context API
* **Formulários e Validação:** React Hook Form + Zod
* **Resiliência e Internacionalização:** React Error Boundary + i18next
* **Atualizações (OTA):** Expo Updates (EAS)
* **Arquitetura:** Feature-Sliced Design (FSD)
* **CI/CD:** Woodpecker CI

---

## 🏗️ Arquitetura do Projeto

O projeto segue rigorosamente o padrão **Feature-Sliced Design (FSD)**, focando em alta coesão, baixo acoplamento e escalabilidade previsível. A separação é feita em camadas estruturadas, indo da infraestrutura base e global até as regras de negócio puras e o roteamento físico.

A estrutura principal de pastas dentro de `src/` está organizada da seguinte forma:

```text
src/
├── shared/               # Infraestrutura corporativa, utilitários e configurações globais (sem regras de negócio)
│   ├── api/              # Cliente HTTP centralizado (httpClient.ts com interceptadores de token e tratamento de 401)
│   ├── config/           # Configurações do ecossistema do app (ex: i18n/locales para internacionalização)
│   ├── db/               # Motor Offline-First (Cliente Drizzle ORM, migrações SQL, repositórios e schemas isolados)
│   ├── lib/              # Inicialização e pontes de bibliotecas externas (ex: auth.ts para Better Auth)
│   ├── providers/        # Provedores globais de contexto (AppProvider, DatabaseProvider, NotificationProvider)
│   └── ui/               # Design System atomizado (Toast, AlertModal, NetworkBanner e tokens do theme.ts)
│
├── features/             # Fatias de negócio independentes, acopladas a domínios comerciais específicos
│   ├── auth/             # Domínio de Autenticação e Sessão Híbrida
│   │   ├── index.ts      # Public API (Barrel File: expõe estritamente o necessário para consumo externo)
│   │   ├── hooks/        # Lógica de estados, ações de login e travas de rede/timeout (useAuth.ts)
│   │   ├── ui/           # Componentes e formulários de interface específicos da feature (LoginForm.tsx)
│   │   └── validations/  # Schemas de validação de dados em tempo de execução com Zod (authSchema.ts)
│   └── profile/          # Domínio de Perfil de Usuário e Configurações locais
│       ├── index.ts      # Public API (Barrel File)
│       └── hooks/        # Manipulação de preferências persistidas e síncronas no SQLite (usePreferences.ts)
│
├── screens/              # Telas completas e composições de blocos, atuando como orquestradoras visuais
│   ├── auth/             # LoginScreen.tsx, SignUpScreen.tsx, ForgotPasswordScreen.tsx
│   ├── main/             # HomeScreen.tsx
│   └── profile/          # ProfileScreen.tsx, SecurityScreen.tsx
│
└── app/                  # Ponto de entrada e roteamento nativo (Expo Router baseado no sistema de arquivos)
    ├── (auth)/           # Fluxo público de acesso (Telas de autenticação)
    ├── (main)/           # Fluxo protegido por sessão (Home, Perfil e navegação por abas)
    └── _layout.tsx       # Inicialização estrutural do app (Injeção de Providers globais e Error Boundary)
```

### Diretriz de Importação:

* **Para garantir a manutenibilidade do código e evitar acoplamento circular, seguimos regras de governança estritas:**

1. **Fluxo Unidirecional de Dependências (Cima para Baixo):** 
    
    * A pasta `app` importa composições das telas de `screens`.

    * A pasta `screens` importa fatias expostas em `features` e bases de `shared`.

    * A pasta `features` consome utilitários de infraestrutura apenas de `shared`.

    * Atenção: O caminho inverso é estritamente proibido. Um arquivo em `shared` jamais pode importar algo de `features` ou `screens`.

2. **Regra de Encapsulamento (Public APIs):**

    * Nenhuma camada ou componente externo tem permissão para importar arquivos de subpastas profundas dentro de uma fatia de `features` (ex: `import { useGlobalAuth } from '@/features/auth/providers/AuthProvider'`).

    * Todo acesso deve ser mediado obrigatoriamente através da Public API da feature (`index.ts`). O consumo externo deve ser limpo e centralizado:
        `import { useGlobalAuth, useAuth, LoginForm } from '@/features/auth';`

3. **Segurança e Persistência Híbrida:**

    * Dados rápidos de visualização para construção de interfaces responsivas e offline ficam em cache na estrutura SQLite (`shared/db`).

    * Informações sensíveis de criptografia e tokens de segurança de autenticação são salvos fora do banco convencional, utilizando o armazenamento encriptado em nível de hardware via `expo-secure-store`.

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