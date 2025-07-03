import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { successResponseSchema } from '@/openapi/common.schemas';

extendZodWithOpenApi(z);

// Response schemas
const fileUploadResponseSchema = z.object({
  message: z.string(),
});

export const registerFilePaths = (registry: OpenAPIRegistry) => {
  // Upload file
  registry.registerPath({
    method: 'post',
    path: '/files/upload',
    tags: ['Files'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.any().describe('File to upload'),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'File uploaded successfully',
        content: {
          'application/json': {
            schema: successResponseSchema.extend({
              data: fileUploadResponseSchema,
            }),
          },
        },
      },
      ...commonResponses,
    },
  });
};
