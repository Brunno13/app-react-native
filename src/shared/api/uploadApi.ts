import { authClient } from '../lib/auth';

interface UploadAvatarResponse {
  success: boolean;
  url: string;
  message?: string;
}

export const uploadAvatarImage = async (
  base64: string, 
  localUri: string
): Promise<string> => {
  try {
    const filename = localUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1]}` : 'image/jpeg';

    // TODO alter to global env
    console.log(`📤 Enviando JSON para: http://api-bun-staging.brunnoserver.duckdns.org/api/avatar`);

    // TODO alter to global env
    const { data, error } = await authClient.$fetch<UploadAvatarResponse>(
      `http://api-bun-staging.brunnoserver.duckdns.org/api/avatar`,
      {
        method: 'POST',
        body: {
          avatarBase64: base64,
          fileName: filename,
          mimeType: fileType,
        }
      }
    );

    if (error) {
      console.error('❌ Falha na API:', error.status, error.statusText);
      throw new Error(`Erro do Servidor: ${error.status}`);
    }

    if (!data || !data.url) {
      throw new Error('A API não retornou a URL da imagem.');
    }

    return data.url;
    
  } catch (error) {
    console.error('❌ Erro fatal no serviço de upload:', error);
    throw error;
  }
};