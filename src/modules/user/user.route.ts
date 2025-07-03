import express from 'express';

import auth, { requireRight } from '@/shared/middlewares/auth';

import * as controllers from './user.controller';

const router = express.Router();

router
  .route('/')
  .post(auth(), controllers.createUser)
  .get(auth(), requireRight('manageUsers'), controllers.getUsers);

router
  .route('/:userId')
  .get(auth(), requireRight('manageUsers'), controllers.getUser)
  .patch(auth(), requireRight('manageUsers'), controllers.updateUser)
  .delete(auth(), requireRight('manageUsers'), controllers.deleteUser);

export default router;
