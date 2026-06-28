import * as SecureStore from 'expo-secure-store';

const SECURE_SESSION_KEY = 'secure_auth_session_data';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

export const httpClient = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
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
      const sessionString = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      
      if (sessionString) {
        const session = JSON.parse(sessionString);
        const token = session.token || session.id; 
        
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Erro ao anexar token na requisição HTTP:', error);
    }
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      console.error('Sessão expirada (401). Iniciando bloqueio de segurança.');
      await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return Promise.reject({ status: response.status, data });
    }

    return data as T;
  } catch (error) {
    return Promise.reject(error);
  }
};