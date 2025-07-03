import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { successResponseSchema, withSuccessResponse } from '@/openapi/common.schemas';

import {
  registerSchema,
  loginSchema,
  logoutSchema,
  refreshTokensSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validation';

// Extract schemas from validation
const registerInputSchema = registerSchema.shape.body;
const loginInputSchema = loginSchema.shape.body;
const logoutInputSchema = logoutSchema.shape.body;
const refreshTokensInputSchema = refreshTokensSchema.shape.body;
const forgotPasswordInputSchema = forgotPasswordSchema.shape.body;
const resetPasswordInputSchema = resetPasswordSchema.shape.body;
const verifyEmailInputSchema = verifyEmailSchema.shape.body;

// Response schemas
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const tokensSchema = z.object({
  access: z.object({
    token: z.string(),
    expires: z.string(),
  }),
  refresh: z.object({
    token: z.string(),
    expires: z.string(),
  }),
});

const registerResponseSchema = z.object({
  user: userSchema,
  tokens: tokensSchema,
});

export const registerAuthPaths = (registry: OpenAPIRegistry) => {
  // Register
  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(registerResponseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Login
  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: loginInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User logged in successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(registerResponseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Logout
  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: logoutInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User logged out successfully',
        content: {
          'application/json': {
            schema: successResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  });

  // Refresh tokens
  registry.registerPath({
    method: 'post',
    path: '/auth/refresh-tokens',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: refreshTokensInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Tokens refreshed successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(tokensSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Forgot password
  registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: forgotPasswordInputSchema,
            example: {
              email: 'test@test.com',
            },
          },
        },
      },
    },
    responses: {
      204: {
        description: 'Reset password email sent successfully',
      },
      ...commonResponses,
    },
  });

  // Reset password
  registry.registerPath({
    method: 'post',
    path: '/auth/reset-password',
    tags: ['Auth'],
    request: {
      query: z.object({
        token: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: resetPasswordInputSchema,
          },
        },
      },
    },
    responses: {
      204: {
        description: 'Password reset successfully',
      },
      ...commonResponses,
    },
  });

  // Send verification email
  registry.registerPath({
    method: 'post',
    path: '/auth/send-verification-email',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
      204: {
        description: 'Verification email sent successfully',
      },
      ...commonResponses,
    },
  });

  // Verify email
  registry.registerPath({
    method: 'post',
    path: '/auth/verify-email',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: verifyEmailInputSchema,
          },
        },
      },
    },
    responses: {
      204: {
        description: 'Email verified successfully',
      },
      ...commonResponses,
    },
  });
};
