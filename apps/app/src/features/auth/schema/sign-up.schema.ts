import z from 'zod';

export const signUpStep1Schema = z.object({
  email: z.string().email('Invalid email address'),
  step: z.literal(1).default(1),
  captcha_token: z.string().min(1, 'Turnstile token is required'),
});

export const signUpStep2Schema = signUpStep1Schema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  step: z.literal(2).default(2),
});

export const signUpStep3Schema = signUpStep2Schema.extend({
  token: z.string().length(6, 'Code must be exactly 6 characters'),
  step: z.literal(3).default(3),
});

export const signUpSchema = z.discriminatedUnion('step', [
  signUpStep1Schema,
  signUpStep2Schema,
  signUpStep3Schema,
]);

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignUpStep1Schema = z.infer<typeof signUpStep1Schema>;
export type SignUpStep2Schema = z.infer<typeof signUpStep2Schema>;
export type SignUpStep3Schema = z.infer<typeof signUpStep3Schema>;
