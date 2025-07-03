import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse, withPaginatedResponse } from '@/openapi/common.schemas';

import {
  createUserSchema,
  getUsersSchema,
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
} from './user.validation';

// Extract schemas from validation
const createUserInputSchema = createUserSchema.shape.body;
const getUsersQuerySchema = getUsersSchema.shape.query;
const getUserParamsSchema = getUserSchema.shape.params;
const updateUserInputSchema = updateUserSchema.shape.body;
const updateUserParamsSchema = updateUserSchema.shape.params;
const deleteUserParamsSchema = deleteUserSchema.shape.params;

// Response schemas
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const registerUserPaths = (registry: OpenAPIRegistry) => {
  // Create user
  registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: createUserInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get users
  registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      query: getUsersQuerySchema,
    },
    responses: {
      200: {
        description: 'Users retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get user by ID
  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'User retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update user
  registry.registerPath({
    method: 'patch',
    path: '/users/{userId}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: updateUserParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: updateUserInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete user
  registry.registerPath({
    method: 'delete',
    path: '/users/{userId}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: deleteUserParamsSchema,
    },
    responses: {
      204: {
        description: 'User deleted successfully',
      },
      ...commonResponses,
    },
  });
};
