import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      ".expo/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "assets/**",
      "coverage/**",
      ".security-results/**",
      "storybook-static/**",
    ],
  },

  {
    files: ["src/**/*.{ts,tsx}"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/**"],
              message:
                "🚨 Arquitetura FSD: É proibido acessar a camada interna de uma feature.\n\n👉 Se você está FORA da feature (ex: na pasta app): Importe apenas da raiz (ex: '@/features/auth').\n👉 Se você está DENTRO da feature: Use caminhos relativos para os arquivos vizinhos (ex: '../hooks/useAuth').",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["scripts/**/*.ts"],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
