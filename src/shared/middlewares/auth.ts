import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import passport from 'passport';

import ApiError from '@/shared/utils/api-error';
import { hasRight } from '@/config/roles';
import { Permission } from '@/types/rbac';
import { ExtendedUser } from '@/types/response';

const verifyCallback =
  (req: any, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void) =>
  async (err: unknown, user: User | false, info: unknown) => {
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    req.user = user as ExtendedUser;
    resolve();
  };

const auth =
  () =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(
          req,
          res,
          next
        );
      });
      next();
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.statusCode).json({
          statusCode: err.statusCode,
          message: err.message,
        });
        return;
      }
      next(err);
    }
  };

const requireRight = (requiredRight: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(httpStatus.UNAUTHORIZED).json({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Please authenticate',
      });
      return;
    }

    const userRoles = (req.user as ExtendedUser).role;
    if (!hasRight(userRoles, requiredRight)) {
      res.status(httpStatus.FORBIDDEN).json({
        statusCode: httpStatus.FORBIDDEN,
        message: 'Forbidden',
      });
      return;
    }

    next();
  };
};

export default auth;
export { requireRight };
