import { z } from 'zod';

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(50, 'O nome não pode exceder 50 caracteres.'),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'A senha atual é obrigatória.'),
  newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres.'),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;