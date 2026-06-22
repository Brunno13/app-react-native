# 📱 App React Native

Frontend mobile do ecossistema, construído com React Native e Expo, utilizando **Bun** como gerenciador de pacotes e executor super-rápido. Integrado nativamente com a `api-bun` para autenticação segura.

## 🚀 Tecnologias Utilizadas

* **Framework:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) (SDK 56)
* **Runtime & Pacotes:** [Bun](https://bun.sh/)
* **Linguagem:** TypeScript
* **Autenticação:** [Better Auth](https://better-auth.com/) (`@better-auth/expo`) + `expo-secure-store` para armazenamento nativo seguro.
* **CI/CD:** [Woodpecker CI](https://woodpecker-ci.org/)
* **Code Review:** IA Integrada (Qwen) via Gitea Webhooks

## ⚙️ Pré-requisitos

Certifique-se de ter o [Bun](https://bun.sh/) instalado no seu ambiente de desenvolvimento.

## 🛠️ Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   bun install
   ```

2. **Configure as Variáveis de Ambiente:**
Certifique-se de que o IP da api-bun no arquivo lib/auth.ts esteja apontando para o seu servidor local (ex: http://192.168.31.215:3000).

3. **Inicie o Metro Bundler:**
    ```
    bun start
    ```
Pressione a para abrir no emulador Android ou leia o QR Code com o aplicativo Expo Go no seu dispositivo físico.

## 🤖 Automação e CI/CD

### Este repositório adota automação estrita para manter a qualidade do código:
* **Woodpecker CI:** A cada push, a pipeline configurada no .woodpecker.yml valida a tipagem do TypeScript usando o Bun.
* **AI Code Review:** Todo Pull Request aberto para a main é automaticamente revisado por nossa Inteligência Artificial local para garantir a aderência às regras do projeto.

Desenvolvido e mantido através de infraestrutura Self-Hosted.
