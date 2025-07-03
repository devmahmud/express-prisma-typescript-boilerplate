import express from 'express';

import auth from '@/shared/middlewares/auth';

import * as controllers from './user.controller';

const router = express.Router();

router.route('/').get(auth(), controllers.getUsers);

router.route('/:userId').get(auth(), controllers.getUser);

export default router;
