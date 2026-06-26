import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import Constants from 'expo-constants'

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

export const authClient = createAuthClient({
    baseURL: apiUrl,
    plugins: [
        expoClient({
            scheme: "app-react-native", 
            storage: SecureStore,       
        }),
    ],
    fetchOptions: {
        headers: {
            Origin: apiUrl, 
        },
    },
})

export const { signIn, signUp, useSession, signOut } = authClient;