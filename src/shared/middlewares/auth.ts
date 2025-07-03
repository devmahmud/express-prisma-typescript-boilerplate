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

const auth = () => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(
      req,
      res,
      next
    );
  })
    .then(() => next())
    .catch((err) => {
      if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
          statusCode: err.statusCode,
          message: err.message,
        });
      }
      next(err);
    });
};

const requireRight = (requiredRight: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        statusCode: httpStatus.UNAUTHORIZED,
        message: 'Please authenticate',
      });
    }

    const userRoles = (req.user as ExtendedUser).role;
    if (!hasRight(userRoles, requiredRight)) {
      return res.status(httpStatus.FORBIDDEN).json({
        statusCode: httpStatus.FORBIDDEN,
        message: 'Forbidden',
      });
    }

    next();
  };
};

export default auth;
export { requireRight };
