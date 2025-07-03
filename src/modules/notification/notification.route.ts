import express from 'express';

import auth from '@/shared/middlewares/auth';

import * as notificationController from './notification.controller';

const router = express.Router();

router
  .route('/')
  .get(auth(), notificationController.getNotifications)
  .delete(auth(), notificationController.deleteAllNotifications);

router.route('/all').get(auth(), notificationController.getAllNotifications);
router.route('/mark-all-read').patch(auth(), notificationController.markAllNotificationsAsRead);
router
  .route('/:notificationId/mark-read')
  .patch(auth(), notificationController.markNotificationAsRead);

router.route('/:notificationId').delete(auth(), notificationController.deleteNotification);

export default router;
