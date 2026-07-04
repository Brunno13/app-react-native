import { getEditProfileSchema, getChangePasswordSchema } from './profileSchema';

const mockT = (key: string) => key;

describe('Profile Schemas', () => {

  describe('getEditProfileSchema', () => {
    const schema = getEditProfileSchema(mockT as any);

    it('deve aceitar um nome válido', () => {
      const result = schema.safeParse({ name: 'Usuário Silva' });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar um nome com menos de 3 caracteres', () => {
      const result = schema.safeParse({ name: 'Zé' });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.nameMin');
      }
    });

    it('deve falhar se o nome tiver espaços em branco que o deixem com menos de 3 caracteres (trim)', () => {
      const result = schema.safeParse({ name: '  A  ' });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.nameMin');
      }
    });

    it('deve rejeitar um nome com mais de 50 caracteres', () => {
      // Gera uma string com 51 letras 'A'
      const nomeGigante = 'A'.repeat(51);
      const result = schema.safeParse({ name: nomeGigante });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.nameMax');
      }
    });
  });

  describe('getChangePasswordSchema', () => {
    const schema = getChangePasswordSchema(mockT as any);

    it('deve aceitar senhas válidas', () => {
      const result = schema.safeParse({
        currentPassword: 'senhaAntiga123',
        newPassword: 'novaSenhaSegura',
      });
      expect(result.success).toBe(true);
    });

    it('deve rejeitar se a senha atual estiver vazia', () => {
      const result = schema.safeParse({
        currentPassword: '',
        newPassword: 'novaSenhaSegura',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.passwordRequired');
      }
    });

    it('deve rejeitar se a nova senha tiver menos de 8 caracteres', () => {
      const result = schema.safeParse({
        currentPassword: 'senhaAntiga123',
        newPassword: 'fraca',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.passwordMin');
      }
    });
  });
});