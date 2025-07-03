import express from 'express';

import authRoute from '../modules/auth/auth.route';
import fileRoute from '../modules/file/file.route';
import healthRoute from '../modules/health/health.route';
import notificationRoute from '../modules/notification/notification.route';
import userRoute from '../modules/user/user.route';
import postRoute from '../modules/post/post.route';
import docsRoute from './docs.route';

const router = express.Router();

interface RouteConfig {
  path: string;
  route: express.Router;
  middleware?: express.RequestHandler[];
}

const routes: RouteConfig[] = [
  {
    path: '/health',
    route: healthRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/files',
    route: fileRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
];

// Register all routes
routes.forEach(({ path, route, middleware = [] }) => {
  if (middleware.length > 0) {
    router.use(path, middleware, route);
  } else {
    router.use(path, route);
  }
});

export default router;
