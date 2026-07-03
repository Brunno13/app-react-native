import { z } from 'zod';
import { TFunction } from 'i18next';

export const getLoginSchema = (t: TFunction) => z.object({
  email: z
    .string()
    .trim()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.emailInvalid')),
  password: z
    .string()
    .min(1, t('validation.passwordRequired'))
});

export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;

export const getRegisterSchema = (t: TFunction) => z.object({
  name: z
    .string()
    .trim()
    .min(3, t('validation.nameMin'))
    .max(50, t('validation.nameMax')),
  email: z
    .string()
    .trim()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.emailInvalid')),
  password: z
    .string()
    .min(8, t('validation.passwordMin')),
  confirmPassword: z
    .string()
    .min(1, t('validation.passwordRequired'))
})
.refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordsDontMatch'),
  path: ['confirmPassword'], 
});

export type RegisterFormData = z.infer<ReturnType<typeof getRegisterSchema>>;

export const getForgotPasswordSchema = (t: TFunction) => z.object({
  email: z
    .string()
    .trim()
    .min(1, t('validation.emailRequired'))
    .email(t('validation.emailInvalid')),
});

export type ForgotPasswordFormData = z.infer<ReturnType<typeof getForgotPasswordSchema>>;