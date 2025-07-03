import { z } from 'zod';

export const errorItemSchema = z.object({
  path: z.string().describe('Location of the error'),
  message: z.string().describe('Error message'),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  message: z.string(),
  errors: z.array(errorItemSchema).optional(), // only for 400-type errors
});

export const unauthorizedResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.literal(401),
  message: z.literal('Unauthorized'),
});

export const forbiddenResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.literal(403),
  message: z.literal('Forbidden'),
});

export const notFoundResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.literal(404),
  message: z.string(), // Allow for dynamic 404 messages
});

export const successResponseSchema = z.object({
  success: z.literal(true),
  statusCode: z.number().default(200),
  message: z.string(),
});

export const paginatedMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  totalResults: z.number(),
});

export const withSuccessResponse = <T extends z.ZodTypeAny>(schema: T) =>
  successResponseSchema.extend({
    data: schema,
  });

export const withPaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  successResponseSchema.extend({
    data: z.object({
      results: z.array(itemSchema),
      ...paginatedMetaSchema.shape,
    }),
  });
