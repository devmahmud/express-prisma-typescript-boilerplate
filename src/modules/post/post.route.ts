import express from 'express';
import { PostController } from './post.controller';
import auth, { requireRight } from '@/shared/middlewares/auth';

const router = express.Router();

router
  .route('/')
  .post(auth(), requireRight('createPost'), PostController.createPost)
  .get(PostController.getPosts);

router
  .route('/:postId')
  .get(PostController.getPost)
  .patch(auth(), requireRight('updateOwnPost'), PostController.updatePost)
  .delete(auth(), requireRight('deleteOwnPost'), PostController.deletePost);

export default router;
