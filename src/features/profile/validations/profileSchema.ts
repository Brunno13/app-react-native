import { z } from 'zod';
import { TFunction } from 'i18next';

export const getEditProfileSchema = (t: TFunction) => z.object({
  name: z
    .string()
    .trim()
    .min(3, t('validation.nameMin'))
    .max(50, t('validation.nameMax')),
});

export type EditProfileFormData = z.infer<ReturnType<typeof getEditProfileSchema>>;

export const getChangePasswordSchema = (t: TFunction) => z.object({
  currentPassword: z
    .string()
    .min(1, t('validation.passwordRequired')),
  newPassword: z
    .string()
    .min(8, t('validation.passwordMin')),
});

export type ChangePasswordFormData = z.infer<ReturnType<typeof getChangePasswordSchema>>;