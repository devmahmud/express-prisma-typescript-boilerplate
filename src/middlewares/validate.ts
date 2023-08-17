import httpStatus from 'http-status';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ApiError from '@/utils/ApiError';

const validate =
  (schema: z.ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
    const validSchema = schema.pick({ params: true, query: true, body: true });
    const obj = validSchema.parse(req);

    const validationRes = validSchema.safeParse(obj);

    if (!validationRes.success) {
      const errorMessage = validationRes.error.issues.map((issue) => issue.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }

    Object.assign(req, validationRes.data);
    return next();
  };

export default validate;
