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
- [x] **Over-the-Air (OTA) Updates:** Configuração do `expo-updates` (EAS Update) para envio ágil de correções de interface e lógica JavaScript sem depender de aprovação nas lojas.
- [x] **Navegação:** Migração para **Expo Router** (baseado em arquivos) para roteamento simplificado e suporte robusto a *deep linking*.
- [x] **Tipagem e Formulários:** Implementação de `zod` e `react-hook-form` para validação nas features.

### ⏳ Próximos Passos
- [ ] **Resiliência e Dicionário:** Integração do `react-error-boundary` para tratamento de erros e `i18next` para internacionalização.
- [ ] **Armazenamento Offline:** Configuração do banco de dados local com `Expo SQLite` e `Drizzle ORM`.
- [ ] **Injeção de Dependências:** Estabelecimento da camada de `Providers` baseada em Context API para distribuição de estados/serviços.
- [ ] **Documentação de UI:** Configuração do `Storybook` para mapear e testar componentes da camada `shared/ui`.
- [ ] **Testes Unitários:** Cobertura de testes utilizando `Jest` e `React Native Testing Library`.
- [ ] **Testes E2E:** Implementação do `Maestro` para testes automatizados de fluxos de usuário e interface end-to-end.
- [ ] **Observabilidade:** Integração do `Firebase Crashlytics` para rastreamento de falhas e monitoramento em produção.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React Native + Expo (SDK 56)
* **Linguagem:** TypeScript
* **Gerenciador de Pacotes:** Bun
* **Navegação:** Expo Router
* **Autenticação:** Better Auth (`@better-auth/expo`)
* **Formulários & Validação:** React Hook Form + Zod
* **Atualizações (OTA):** Expo Updates (EAS)
* **Arquitetura:** Feature-Sliced Design (FSD)
* **CI/CD:** Woodpecker CI

---

## 🏗️ Arquitetura do Projeto

O projeto segue o padrão **Feature-Sliced Design (FSD)**, focando em manter o código organizado e fácil de escalar. A separação é feita em camadas, indo da base (código global) até o topo (telas e rotas).

A estrutura principal fica na pasta `src/`:

```text
src/
├── shared/     # Código compartilhado e configurações globais
│   ├── lib/    # Inicialização de bibliotecas (ex: auth.ts)
│   └── ui/     # Componentes visuais globais (Botões, Inputs, Temas)
│
├── features/   # Regras de negócio e componentes específicos
│   └── auth/   # Ex: Funcionalidades de Autenticação
│       ├── hooks/  # Lógica e consumo de API (useAuth.ts)
│       └── ui/     # Interface específica (LoginForm.tsx)
│
├── screens/    # Telas completas, separadas por contexto
│   ├── auth/   # Ex: LoginScreen.tsx, SignUpScreen.tsx
│   ├── main/   # Ex: HomeScreen.tsx
│   └── settings/ # Ex: ProfileScreen.tsx
│
└── app/        # Roteamento de telas (Expo Router)
    ├── (auth)/ # Rotas públicas (Login, Cadastro)
    ├── (main)/ # Rotas protegidas (Home, Perfil com abas)
    └── _layout.tsx # Configuração inicial e proteção de rotas
```

### Diretriz de Importação::

* **O fluxo é de cima para baixo.** 

1. A pasta `app` importa as telas da pasta `screens`.

2. A pasta `screens` importa os componentes da pasta `features` e `shared`.

3. A pasta `features` importa os itens da pasta `shared`.

* **Atenção:** O caminho inverso não é permitido. Um componente em shared não pode importar algo de features, e uma feature não pode importar uma tela de screens. Isso evita problemas de dependência no código.

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