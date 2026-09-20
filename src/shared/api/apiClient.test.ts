import { apiClient, setUnauthorizedInterceptor } from './apiClient';

const fetchMock = jest.fn<Promise<Response>, Parameters<typeof fetch>>();

Object.defineProperty(global, 'fetch', {
  writable: true,
  value: fetchMock,
});

describe('apiClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar a requisição com sucesso e retornar os dados', async () => {
    const mockData = { name: 'Brunno' };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiClient('/users/me');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.any(Object),
    );

    expect(result).toEqual(mockData);
  });

  it('deve acionar o interceptor de 401 quando a sessão expirar', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as Response);

    const mockInterceptor = jest.fn(() => Promise.resolve());
    setUnauthorizedInterceptor(mockInterceptor);

    await expect(
      apiClient('/protected'),
    ).rejects.toThrow(
      'Sessão expirada. Por favor, faça login novamente.',
    );

    expect(mockInterceptor).toHaveBeenCalledTimes(1);
  });
});
