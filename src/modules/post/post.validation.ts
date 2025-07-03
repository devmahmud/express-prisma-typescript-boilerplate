import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    published: z.boolean().optional(),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    title: z.string().optional(),
    published: z.boolean().optional(),
    sortBy: z.string().optional(),
    limit: z.number().int().positive().optional(),
    page: z.number().int().positive().optional(),
  }),
});

export const getPostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
  body: z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
      published: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const deletePostSchema = z.object({
  params: z.object({
    postId: z.string().min(1, 'Post ID is required'),
  }),
});
