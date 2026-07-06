import { ENV } from '@/shared/config/env';

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = ENV.API_URL;

let onUnauthorizedCallback: (() => void) | null = null;
let onServerErrorCallback: ((endpoint: string, status: number, errorData: any) => void) | null = null;

export const setUnauthorizedInterceptor = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

export const setServerErrorInterceptor = (callback: (endpoint: string, status: number, errorData: any) => void) => {
  onServerErrorCallback = callback;
};

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      if (response.status === 401) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        throw new ApiError(401, 'Sessão expirada. Por favor, faça login novamente.', errorData);
      }

      if (response.status >= 500) {
        if (onServerErrorCallback) {
          onServerErrorCallback(endpoint, response.status, errorData);
        }
      }

      throw new ApiError(response.status, errorData?.message || 'Erro na requisição', errorData);
    }

    return (await response.json()) as T;

  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      if (onServerErrorCallback) {
        onServerErrorCallback(endpoint, 0, { message: 'Network connection failed / Server offline' });
      }
      throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
      // throw new ApiError(0, `Falha de rede. O app tentou conectar em: ${BASE_URL}${endpoint}`); //TODO for debug
    }
    throw error;
  }
};