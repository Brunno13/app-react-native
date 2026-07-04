import { authClient } from '@/shared/lib/auth';
import { ENV, API_ENDPOINTS } from '@/shared/config/env';

interface UploadAvatarResponse {
  success: boolean;
  url: string;
  message?: string;
}

export interface AvatarUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Serviço de upload de avatar — encapsula lógica de upload e validação.
 */
export const uploadAvatarImage = async (
  base64: string, 
  localUri: string
): Promise<AvatarUploadResult> => {
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
      return { 
        success: false, 
        error: `Erro do Servidor: ${error.status}` 
      };
    }

    if (!data || !data.url) {
      return { 
        success: false, 
        error: 'A API não retornou a URL da imagem.' 
      };
    }

    return { success: true, url: data.url };
    
  } catch (error) {
    console.error('❌ Erro fatal no serviço de upload:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};
