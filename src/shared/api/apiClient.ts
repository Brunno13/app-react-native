import { ENV } from '@/shared/config/env';

type UnauthorizedInterceptor = () => void | Promise<void>;

type ServerErrorInterceptor = (
  endpoint: string,
  status: number,
  errorData: unknown,
) => void | Promise<void>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = ENV.API_URL;

let onUnauthorizedCallback: UnauthorizedInterceptor | null = null;
let onServerErrorCallback: ServerErrorInterceptor | null = null;

export const setUnauthorizedInterceptor = (
  callback: UnauthorizedInterceptor,
) => {
  onUnauthorizedCallback = callback;
};

export const setServerErrorInterceptor = (
  callback: ServerErrorInterceptor,
) => {
  onServerErrorCallback = callback;
};

const getErrorMessage = (errorData: unknown): string | undefined => {
  if (
    typeof errorData !== 'object' ||
    errorData === null ||
    !('message' in errorData)
  ) {
    return undefined;
  }

  const { message } = errorData;

  return typeof message === 'string'
    ? message
    : undefined;
};

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData: unknown = await response
        .json()
        .catch(() => null);

      if (response.status === 401) {
        if (onUnauthorizedCallback) {
          await onUnauthorizedCallback();
        }

        throw new ApiError(
          401,
          'Sessão expirada. Por favor, faça login novamente.',
          errorData,
        );
      }

      if (
        response.status >= 500 &&
        onServerErrorCallback
      ) {
        await onServerErrorCallback(
          endpoint,
          response.status,
          errorData,
        );
      }

      throw new ApiError(
        response.status,
        getErrorMessage(errorData) ?? 'Erro na requisição',
        errorData,
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (
      error instanceof TypeError &&
      error.message === 'Failed to fetch'
    ) {
      if (onServerErrorCallback) {
        await onServerErrorCallback(
          endpoint,
          0,
          {
            message:
              'Network connection failed / Server offline',
          },
        );
      }

      throw new ApiError(
        0,
        'Não foi possível conectar ao servidor. Verifique sua conexão.',
      );
    }

    throw error;
  }
};
