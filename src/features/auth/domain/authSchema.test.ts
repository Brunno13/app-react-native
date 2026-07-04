import { getLoginSchema, getRegisterSchema, getForgotPasswordSchema } from './authSchema';
import { TFunction } from 'i18next';

const mockT = ((key: string) => key) as unknown as TFunction;

describe('Validações Zod (authSchema)', () => {

  describe('getLoginSchema', () => {
    const loginSchema = getLoginSchema(mockT);

    it('deve validar com sucesso um payload correto', () => {
      const result = loginSchema.safeParse({
        email: 'brunno@teste.com',
        password: 'SenhaForte123',
      });
      expect(result.success).toBe(true);
    });

    it('deve reprovar se o e-mail for inválido e retornar a chave de tradução correta', () => {
      const result = loginSchema.safeParse({
        email: 'brunno_sem_arroba.com',
        password: 'SenhaForte123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.emailInvalid');
      }
    });

    it('deve reprovar se o e-mail estiver vazio', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'SenhaForte123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.emailRequired');
      }
    });

    it('deve reprovar se a senha estiver vazia', () => {
      const result = loginSchema.safeParse({
        email: 'brunno@teste.com',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.passwordRequired');
      }
    });
  });

  describe('getRegisterSchema', () => {
    const registerSchema = getRegisterSchema(mockT);

    it('deve validar com sucesso um cadastro com dados perfeitos', () => {
      const result = registerSchema.safeParse({
        name: 'Brunno',
        email: 'brunno@teste.com',
        password: 'SenhaForte123',
        confirmPassword: 'SenhaForte123',
      });
      expect(result.success).toBe(true);
    });

    it('deve reprovar se o nome tiver menos de 3 caracteres', () => {
      const result = registerSchema.safeParse({
        name: 'Br',
        email: 'brunno@teste.com',
        password: 'SenhaForte123',
        confirmPassword: 'SenhaForte123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.nameMin');
      }
    });

    it('deve reprovar se a senha tiver menos de 8 caracteres', () => {
      const result = registerSchema.safeParse({
        name: 'Brunno',
        email: 'brunno@teste.com',
        password: '123',
        confirmPassword: '123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.passwordMin');
      }
    });

    it('deve reprovar (refine) se as senhas não coincidirem', () => {
      const result = registerSchema.safeParse({
        name: 'Brunno',
        email: 'brunno@teste.com',
        password: 'SenhaForte123',
        confirmPassword: 'SenhaDiferente999',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        // Verifica se o erro acusou a chave certa
        expect(result.error.issues[0].message).toBe('validation.passwordsDontMatch');
        // Verifica se o Zod anexou o erro no campo correto (confirmPassword)
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });
  });

  describe('getForgotPasswordSchema', () => {
    const forgotPasswordSchema = getForgotPasswordSchema(mockT);

    it('deve validar com sucesso um e-mail correto', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'brunno@teste.com',
      });
      expect(result.success).toBe(true);
    });

    it('deve reprovar formatação inválida', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'brunno.com',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('validation.emailInvalid');
      }
    });
  });

});