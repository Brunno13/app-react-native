import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
    // Aponte para o IP da sua api-bun onde o servidor do better-auth está rodando
    baseURL: "http://192.168.31.215:3000",
    plugins: [
        expoClient({
            scheme: "app-react-native", // O nome do seu app
            storage: SecureStore,       // Salva o token de forma segura nativamente
        }),
    ],
})

export const { signIn, signUp, useSession } = authClient;