import { uploadAvatarImage } from './uploadApi';
import { authClient } from '@/shared/lib/auth';

jest.mock('@/shared/lib/auth', () => ({
  authClient: {
    $fetch: jest.fn(),
  },
}));

jest.mock('@/shared/config/env', () => ({
  ENV: { API_URL: 'https://api.meuapp.com' },
  API_ENDPOINTS: { UPLOAD_AVATAR: '/api/users/avatar' },
}));

describe('Profile API - uploadAvatarImage', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar o upload com sucesso e retornar a URL', async () => {
    (authClient.$fetch as jest.Mock).mockResolvedValueOnce({
      data: { success: true, url: 'https://cdn.meuapp.com/avatar123.jpg' },
      error: null,
    });

    const result = await uploadAvatarImage('base64-string-fake', 'file:///data/user/fotos/minha_foto.png');

    expect(authClient.$fetch).toHaveBeenCalledWith(
      'https://api.meuapp.com/api/users/avatar',
      {
        method: 'POST',
        body: {
          avatarBase64: 'base64-string-fake',
          fileName: 'minha_foto.png',
          mimeType: 'image/png',
        },
      }
    );

    expect(result).toEqual({ success: true, url: 'https://cdn.meuapp.com/avatar123.jpg' });
  });

  it('deve retornar erro se a API responder com status de erro', async () => {
    (authClient.$fetch as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { status: 500, statusText: 'Internal Server Error' },
    });

    const result = await uploadAvatarImage('base64-fake', 'foto.jpg');

    expect(result).toEqual({ success: false, error: 'Erro do Servidor: 500' });
  });

  it('deve retornar erro se a API der sucesso mas omitir a URL', async () => {
    (authClient.$fetch as jest.Mock).mockResolvedValueOnce({
      data: { success: true },
      error: null,
    });

    const result = await uploadAvatarImage('base64-fake', 'foto.jpg');

    expect(result).toEqual({ success: false, error: 'A API não retornou a URL da imagem.' });
  });

  it('deve cair no catch e retornar erro fatal se houver exceção na requisição', async () => {
    (authClient.$fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));

    const result = await uploadAvatarImage('base64-fake', 'foto.jpg');

    expect(result).toEqual({ success: false, error: 'Network timeout' });
  });
});