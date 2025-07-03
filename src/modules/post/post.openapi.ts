import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse, withPaginatedResponse } from '@/openapi/common.schemas';

// Input schemas (converted from Joi to Zod)
const createPostInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  published: z.boolean().optional(),
});

const getPostsQuerySchema = z.object({
  title: z.string().optional(),
  published: z.boolean().optional(),
  sortBy: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

const getPostParamsSchema = z.object({
  postId: z.string(),
});

const updatePostInputSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

const updatePostParamsSchema = z.object({
  postId: z.string(),
});

const deletePostParamsSchema = z.object({
  postId: z.string(),
});

// Response schemas
const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  authorId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const registerPostPaths = (registry: OpenAPIRegistry) => {
  // Create post
  registry.registerPath({
    method: 'post',
    path: '/posts',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: createPostInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Post created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(postSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get posts
  registry.registerPath({
    method: 'get',
    path: '/posts',
    tags: ['Posts'],
    request: {
      query: getPostsQuerySchema,
    },
    responses: {
      200: {
        description: 'Posts retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(postSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get post by ID
  registry.registerPath({
    method: 'get',
    path: '/posts/{postId}',
    tags: ['Posts'],
    request: {
      params: getPostParamsSchema,
    },
    responses: {
      200: {
        description: 'Post retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(postSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update post
  registry.registerPath({
    method: 'patch',
    path: '/posts/{postId}',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    request: {
      params: updatePostParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: updatePostInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Post updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(postSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete post
  registry.registerPath({
    method: 'delete',
    path: '/posts/{postId}',
    tags: ['Posts'],
    security: [{ bearerAuth: [] }],
    request: {
      params: deletePostParamsSchema,
    },
    responses: {
      204: {
        description: 'Post deleted successfully',
      },
      ...commonResponses,
    },
  });
};
