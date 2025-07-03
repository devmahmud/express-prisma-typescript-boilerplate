import { z } from 'zod';

export const password = z
  .string()
  .min(8, 'password must be at least 8 characters')
  .refine(
    (value) => value.match(/\d/) && value.match(/[a-zA-Z]/),
    'Password must contain at least 1 letter and 1 number'
  );

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: password,
    name: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const refreshTokensSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
  body: z.object({
    password: password,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});
