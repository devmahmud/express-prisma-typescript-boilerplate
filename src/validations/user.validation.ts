import { Role } from '@prisma/client';
import z from 'zod';
import { password } from './custom.validation';

const createUser = z.object({
  body: z.object({
    email: z.string().email(),
    password: password,
    name: z.string().min(1),
    role: z.enum([Role.USER, Role.ADMIN]),
  }),
});

const getUsers = z.object({
  query: z.object({
    name: z.string().min(1).optional(),
    role: z.enum([Role.USER, Role.ADMIN]).optional(),
    sortBy: z.enum(['createdAt', 'name']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
});

const getUser = z.object({
  params: z.object({
    userId: z.coerce.number().int(),
  }),
});

const updateUser = z.object({
  params: z.object({
    userId: z.coerce.number().int(),
  }),
  body: z.object({
    email: z.string().email().optional(),
    password: password.optional(),
    name: z.string().min(1).optional(),
  }),
});

const deleteUser = z.object({
  params: z.object({
    userId: z.coerce.number().int(),
  }),
});

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
