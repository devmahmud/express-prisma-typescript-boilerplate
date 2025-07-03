import type { Request } from 'express';
import httpStatus from 'http-status';
import { AnyZodObject, ZodError, z } from 'zod';

import ApiError from '@/shared/utils/api-error';

export async function zParse<T extends AnyZodObject>(schema: T, req: Request): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(req);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid request data',
        true,
        undefined,
        validationErrors
      );
    }
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid request data');
  }
}

export default zParse;
