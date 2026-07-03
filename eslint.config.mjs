import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [".expo/", "node_modules/", "dist/", "build/", "assets/"]
  },
  
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/**"],
              message: "🚨 Arquitetura FSD: É proibido acessar a camada interna de uma feature.\n\n👉 Se você está FORA da feature (ex: na pasta app): Importe apenas da raiz (ex: '@/features/auth').\n👉 Se você está DENTRO da feature: Use caminhos relativos para os arquivos vizinhos (ex: '../hooks/useAuth')."
            }
          ]
        }
      ]
    }
  }
];