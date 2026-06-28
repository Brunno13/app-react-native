import * as SecureStore from 'expo-secure-store';

const SECURE_SESSION_KEY = 'secure_auth_session_data';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const httpClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  // Por padrão, todas as requisições exigem autenticação, a menos que seja dito o contrário
  const { requireAuth = true, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (requireAuth) {
    try {
      // 1. Busca o token do cofre nativo
      const sessionString = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      
      if (sessionString) {
        const session = JSON.parse(sessionString);
        // O Better Auth geralmente valida a sessão pelo ID ou Token retornado no login
        const token = session.token || session.id; 
        
        // 2. Anexa o token ao cabeçalho padrão de autorização
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao anexar token na requisição HTTP:', error);
    }
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    // 3. Interceptador de Erro 401 (Sessão Expirada / Token Inválido)
    if (response.status === 401) {
      console.error('Sessão expirada (401). Iniciando bloqueio de segurança.');
      // Limpa os cofres instantaneamente. 
      // Na próxima re-renderização, o AuthProvider notará a falta de sessão e ejetará o usuário para o Login
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
      // Eventualmente podemos adicionar um disparo de evento global aqui se necessário
    }

    // Tenta fazer o parse do JSON (se houver conteúdo)
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Promise.reject({ status: response.status, data });
    }

    return data as T;
  } catch (error) {
    return Promise.reject(error);
  }
};