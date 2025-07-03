import z from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
  }),
});

export type GetNotificationsType = z.infer<typeof getNotificationsSchema>;
