import { apiClient, setUnauthorizedInterceptor } from './apiClient';

global.fetch = jest.fn();

describe('apiClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar a requisição com sucesso e retornar os dados', async () => {
    const mockData = { name: 'Brunno' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiClient('/users/me');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.any(Object)
    );
    expect(result).toEqual(mockData);
  });

  it('deve acionar o interceptor de 401 quando a sessão expirar', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const mockInterceptor = jest.fn();
    setUnauthorizedInterceptor(mockInterceptor);

    await expect(apiClient('/protected')).rejects.toThrow('Sessão expirada. Por favor, faça login novamente.');
    
    expect(mockInterceptor).toHaveBeenCalledTimes(1);
  });
});