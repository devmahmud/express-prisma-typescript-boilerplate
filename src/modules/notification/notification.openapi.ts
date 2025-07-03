import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withPaginatedResponse } from '@/openapi/common.schemas';

import { getNotificationsSchema } from './notification.validation';

// Extract schemas from validation
const getNotificationsQuerySchema = getNotificationsSchema.shape.query;

// Response schemas
const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success']),
  isRead: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const registerNotificationPaths = (registry: OpenAPIRegistry) => {
  // Get notifications
  registry.registerPath({
    method: 'get',
    path: '/notifications',
    tags: ['Notifications'],
    security: [{ bearerAuth: [] }],
    request: {
      query: getNotificationsQuerySchema,
    },
    responses: {
      200: {
        description: 'Notifications retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(notificationSchema),
          },
        },
      },
      ...commonResponses,
    },
  });
};
