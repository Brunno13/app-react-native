import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um formato de e-mail válido.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(50, 'O nome não pode exceder 50 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um formato de e-mail válido.'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  confirmPassword: z
    .string()
    .min(1, 'A confirmação de senha é obrigatória.')
})

.refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Digite um formato de e-mail válido.'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;