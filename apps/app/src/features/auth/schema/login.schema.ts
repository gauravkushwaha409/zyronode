import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  checkbox: z.boolean().refine((value) => value === true, {
    message: 'You must accept the terms and conditions',
  }),
  captcha_token: z.string().min(1, 'Turnstile token is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
