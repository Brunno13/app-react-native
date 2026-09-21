import {
  ApiError,
  apiClient,
  setServerErrorInterceptor,
  setUnauthorizedInterceptor,
} from './apiClient';

const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

Object.defineProperty(global, 'fetch', {
  writable: true,
  value: fetchMock,
});

interface ExpectedApiError {
  status: number;
  message: string;
  data?: unknown;
}

const expectApiError = async (
  promise: Promise<unknown>,
  expected: ExpectedApiError,
) => {
  try {
    await promise;
    throw new Error('Esperava ApiError, mas a Promise resolveu');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw error;
    }

    expect(error.status).toBe(expected.status);
    expect(error.message).toBe(expected.message);
    expect(error.data).toEqual(expected.data);
  }
};

describe('apiClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar a requisicao com sucesso e retornar os dados', async () => {
    const mockData = { name: 'Brunno' };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiClient('/users/me', {
      headers: {
        'X-Request-Test': 'enabled',
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Test': 'enabled',
        },
      }),
    );
    expect(result).toEqual(mockData);
  });

  it('deve acionar o interceptor de 401 quando a sessao expirar', async () => {
    const errorData = { message: 'Unauthorized' };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve(errorData),
    } as Response);

    const mockInterceptor = jest.fn<Promise<void>, []>(() => Promise.resolve());
    setUnauthorizedInterceptor(mockInterceptor);

    await expectApiError(apiClient('/protected'), {
      status: 401,
      message: 'Sessão expirada. Por favor, faça login novamente.',
      data: errorData,
    });

    expect(mockInterceptor).toHaveBeenCalledTimes(1);
  });

  it('deve usar a mensagem retornada pela API em erros HTTP', async () => {
    const errorData = { message: 'Campo inválido' };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve(errorData),
    } as Response);

    await expectApiError(apiClient('/invalid'), {
      status: 400,
      message: 'Campo inválido',
      data: errorData,
    });
  });

  it('deve usar mensagem padrao quando o corpo de erro nao for JSON valido', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.reject(new SyntaxError('JSON inválido')),
    } as Response);

    await expectApiError(apiClient('/invalid-json'), {
      status: 400,
      message: 'Erro na requisição',
      data: null,
    });
  });

  it('deve usar mensagem padrao quando message nao for string', async () => {
    const errorData = { message: 503 };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve(errorData),
    } as Response);

    await expectApiError(apiClient('/invalid-message'), {
      status: 400,
      message: 'Erro na requisição',
      data: errorData,
    });
  });

  it('deve acionar o interceptor em erros 5xx', async () => {
    const errorData = { message: 'Serviço indisponível' };

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: () => Promise.resolve(errorData),
    } as Response);

    const mockInterceptor = jest.fn<
      Promise<void>,
      [string, number, unknown]
    >(() => Promise.resolve());

    setServerErrorInterceptor(mockInterceptor);

    await expectApiError(apiClient('/health'), {
      status: 503,
      message: 'Serviço indisponível',
      data: errorData,
    });

    expect(mockInterceptor).toHaveBeenCalledWith(
      '/health',
      503,
      errorData,
    );
  });

  it('deve converter falha de rede em ApiError e notificar o interceptor', async () => {
    const mockInterceptor = jest.fn<
      Promise<void>,
      [string, number, unknown]
    >(() => Promise.resolve());

    setServerErrorInterceptor(mockInterceptor);
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expectApiError(apiClient('/offline'), {
      status: 0,
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    });

    expect(mockInterceptor).toHaveBeenCalledWith(
      '/offline',
      0,
      {
        message: 'Network connection failed / Server offline',
      },
    );
  });

  it('deve propagar erros inesperados sem converte-los', async () => {
    const unexpectedError = new TypeError('Erro inesperado');
    fetchMock.mockRejectedValueOnce(unexpectedError);

    await expect(apiClient('/unexpected')).rejects.toBe(unexpectedError);
  });
});
