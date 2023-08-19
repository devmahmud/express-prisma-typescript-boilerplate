import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ApiError from '@/utils/ApiError';
import pick from '@/utils/pick';

const validate =
  (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = schema.pick({ params: true, query: true, body: true });

    const validationRes = validSchema.safeParse(pick(req, Object.keys(validSchema.shape)));

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map((err) => {
        const path = err.path.join('.');
        return { path, message: err.message };
      });
      return next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          "Invalid request's body or query params",
          true,
          undefined,
          validationErrors
        )
      );
    }

    Object.assign(req, validationRes.data);
    return next();
  };

export default validate;
