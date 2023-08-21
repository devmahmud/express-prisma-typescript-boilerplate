import { z } from 'zod';
import { password } from './custom.validation';

const register = z.object({
  body: z.object({
    email: z.string().email(),
    password: password,
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const logout = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

const refreshTokens = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPassword = z.object({
  query: z.object({
    token: z.string(),
  }),
  body: z.object({
    password: password,
  }),
});

const verifyEmail = z.object({
  query: z.object({
    token: z.string(),
  }),
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
