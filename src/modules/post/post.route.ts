import express from 'express';
import { PostController } from './post.controller';
import { validate } from '@/shared/utils/validate';
import { postValidation } from './post.validation';
import auth from '@/shared/middlewares/auth';
import { hasRight } from '@/config/roles';
import { Permission } from '@/types/rbac';
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ExtendedUser } from '@/types/response';

// Role-based access control middleware
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

const router = express.Router();

router
  .route('/')
  .post(
    auth(),
    requireRight('createPost'),
    validate(postValidation.createPost),
    PostController.createPost
  )
  .get(validate(postValidation.getPosts), PostController.getPosts);

router
  .route('/:postId')
  .get(validate(postValidation.getPost), PostController.getPost)
  .patch(
    auth(),
    requireRight('updateOwnPost'),
    validate(postValidation.updatePost),
    PostController.updatePost
  )
  .delete(
    auth(),
    requireRight('deleteOwnPost'),
    validate(postValidation.deletePost),
    PostController.deletePost
  );

export default router;
