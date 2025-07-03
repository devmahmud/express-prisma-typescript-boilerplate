import { Role } from '@prisma/client';
import z from 'zod';

import { password } from '../auth/auth.validation';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: password,
    name: z.string().min(1),
    role: z.nativeEnum(Role),
  }),
});

export const getUsersSchema = z.object({
  query: z.object({
    name: z.string().min(1).optional(),
    role: z.nativeEnum(Role).optional(),
    sortBy: z.enum(['createdAt', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z.object({
    email: z.string().email().optional(),
    password: password.optional(),
    name: z.string().min(1).optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
});
