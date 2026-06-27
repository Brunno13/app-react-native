import { authClient } from '../lib/auth';
import { ENV, API_ENDPOINTS } from '../config/env';

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
    const endpoint = `${ENV.API_URL}${API_ENDPOINTS.UPLOAD_AVATAR}`;

    console.log(`📤 Enviando JSON para: ${endpoint}`);

    const { data, error } = await authClient.$fetch<UploadAvatarResponse>(
      endpoint,
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