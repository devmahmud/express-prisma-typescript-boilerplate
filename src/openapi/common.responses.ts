import {
  errorResponseSchema,
  forbiddenResponseSchema,
  notFoundResponseSchema,
  unauthorizedResponseSchema,
} from './common.schemas';

export const commonResponses = {
  400: {
    description: 'Bad Request - Invalid data',
    content: {
      'application/json': {
        schema: errorResponseSchema,
      },
    },
  },
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: unauthorizedResponseSchema,
      },
    },
  },
  403: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: forbiddenResponseSchema,
      },
    },
  },
  404: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: notFoundResponseSchema,
      },
    },
  },
};
