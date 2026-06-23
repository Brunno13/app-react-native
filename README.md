# 📱 App React Native (App Bun)

Aplicativo mobile multiplataforma construído com React Native e Expo, utilizando **Bun** como gerenciador de pacotes. O projeto conta com autenticação robusta via `better-auth`, gerenciamento dinâmico de ambientes e pipeline de CI/CD automatizada para geração de releases Android.

---

## 🗺️ Roadmap do Projeto

### ✅ Concluído (Fundação e Automação)
- [x] **Setup Inicial:** Inicialização com React Native, Expo e Bun.
- [x] **Autenticação:** Integração robusta do cliente `@better-auth/expo`.
- [x] **Arquitetura:** Reestruturação estrita para o padrão Feature-Sliced Design (FSD).
- [x] **Gestão de Ambientes:** Flavors dinâmicos (Staging / Produção) sem sujeira nativa.
- [x] **Tooling:** Script cross-platform 100% Bun-Native para build automatizado.
- [x] **CI/CD:** Pipeline completa no Woodpecker (Geração de Release, APK e sincronização Gitea/GitHub).

### ⏳ Em Andamento / Próximos Passos (Nível Enterprise)
- [ ] **Tipagem Estrita e Formulários:** Implementação de `zod` e `react-hook-form` (+ resolvers) para validação end-to-end nas features.
- [ ] **Armazenamento Offline:** Configuração do banco de dados local com `Expo SQLite` e `Drizzle ORM` (espelhando a stack do back-end).
- [ ] **Injeção de Dependências:** Estabelecimento da camada de `Providers` baseada em Context API para distribuição global de estados/serviços.
- [ ] **Resiliência e Dicionário:** Integração do `react-error-boundary` (para evitar crashes de UI) e `i18next` (para centralizar todas as strings do app).
- [ ] **Documentação de UI:** Configuração do `Storybook` para mapear, visualizar e testar componentes da camada `shared/ui` isoladamente.
- [ ] **Testes Unitários:** Cobertura de testes de componentes e regras de negócio utilizando `Jest` e `React Native Testing Library`.
- [ ] **Observabilidade Global:** Integração do **Firebase Crashlytics** para rastreamento de falhas fatais e monitoramento de estabilidade em produção.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** React Native + Expo (SDK 56)
* **Linguagem:** TypeScript
* **Gerenciador de Pacotes:** Bun
* **Autenticação:** Better Auth (`@better-auth/expo`)
* **Arquitetura:** Feature-Sliced Design (FSD) adaptado
* **CI/CD:** Woodpecker CI (Geração automatizada de APK)

---

## 🏗️ Arquitetura do Projeto

O projeto segue estritamente o padrão **Feature-Sliced Design (FSD)**, garantindo que o código seja altamente escalável, modular e de fácil manutenção. A separação ocorre da base (módulos globais) para o topo (telas completas).

A estrutura principal reside na pasta `src/`:

```text
src/
├── shared/     # 🧱 A Base (Código compartilhado e configurações)
│   ├── lib/    # Inicialização de bibliotecas de terceiros (ex: auth.ts)
│   └── ui/     # Componentes visuais "burros" e globais (Botões, Inputs padrão)
│
├── features/   # 🧩 As Funcionalidades (Regras de negócio fatiadas)
│   └── auth/   # Ex: Domínio de Autenticação
│       ├── hooks/  # Lógica complexa e chamadas de API (useAuth.ts)
│       └── ui/     # Fragmentos de interface atrelados à regra (LoginForm.tsx)
│
├── screens/    # 📱 As Telas (Composição)
│   └──         # Telas completas que juntam as features (HomeScreen, AuthScreen)
│
└── app/        # 🚀 O Ponto de Entrada
                # (Provedores de contexto globais, temas, etc.)
```

### Regra de Ouro da Arquitetura:

* **O fluxo de importação é sempre de cima para baixo.** Telas (screens) importam funcionalidades (features), que por sua vez podem importar módulos globais (shared). Nunca o inverso.

---

## 🌍 Ambientes (Flavors Dinâmicos)

O aplicativo utiliza o app.config.ts em conjunto com o cross-env para alternar entre ambientes de Staging e Produção dinamicamente, sem a necessidade de flavors nativos do Android/iOS.

* **Staging (Padrão):** O app se chama App Bun (Staging), utiliza o pacote com.brunno.app.staging e aponta para a api-bun local.

* **Produção:** O app se chama App Bun, utiliza o pacote com.brunno.app e aponta para o servidor real com suporte a tráfego HTTPS seguro.

---

## 🚀 Como Rodar e Buildar o Projeto Localmente

### Pré-requisitos
* [Bun](https://bun.sh/) instalado.
* Android Studio (Emulador) configurado ou celular físico com Expo Go.

### 💻 Modo de Desenvolvimento (Live Reload)

1. **Instale as dependências:**
    ```bash
    bun install
    ```

2. **Inicie o servidor de desenvolvimento (Ambiente Staging):**
    ```bash
    bun run android
    # ou bun start
    ```

3. **Para testar localmente com configurações de Produção:**
    ```bash
    bun run android:prod
    ```

### 📦 Gerando o APK Localmente (Script Cross-Platform)
Não é necessário configurar o caminho do Android SDK manualmente. O projeto possui um script inteligente (scripts/build-apk.ts) que detecta o seu sistema operacional (Windows, macOS ou Linux), configura as variáveis locais e executa o Gradle de forma limpa e automática.

**Para gerar os binários na sua máquina, utilize os comandos abaixo:**
* **Gerar APK de Staging (Permite HTTP local):**
    ```bash
    bun run build:apk
    ```

* **Gerar APK de Produção (Exige HTTPS seguro):**
    ```bash
    bun run build:apk:prod
    ```

**Ao final do processo, os arquivos ficarão disponíveis na raiz do projeto com o nome app-react-native-staging.apk ou app-react-native-production.apk.**

---

## 📦 CI/CD e Automação de Release

Este repositório possui uma pipeline configurada no Woodpecker CI (.woodpecker/release.yml) para geração automática de binários Android.

**Fluxo de Release:**
1. Sempre que uma nova Tag for criada no Gitea (ex: v1.0.0), o Woodpecker é acionado.

2. O runner utiliza a imagem do React Native para injetar o APP_ENV=production.

3. Ocorre o expo prebuild e em seguida o empacotamento via Gradle (assembleRelease).

4. Um novo Release é criado no repositório do Gitea contendo o arquivo .apk final assinado e pronto para instalação/distribuição.

---

## 🔐 Segurança e Tráfego Local

Durante o desenvolvimento (Staging), o aplicativo está configurado via expo-build-properties para permitir tráfego HTTP em texto claro (usesCleartextTraffic: true), permitindo a comunicação fluida com a API local (ex: http://192.168.x.x). A versão de produção compila nativamente exigindo conexões HTTPS.

---