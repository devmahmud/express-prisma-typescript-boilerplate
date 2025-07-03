import { User } from '@prisma/client';
import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';

import * as notificationService from './notification.service';
import { getNotificationsSchema } from './notification.validation';

export const getNotifications = catchAsync(async (req) => {
  const user = req.user as User;
  const { query } = await zParse(getNotificationsSchema, req);
  const notifications = await notificationService.queryNotifications(user.id, query);
  return {
    statusCode: httpStatus.OK,
    message: 'Notifications fetched successfully',
    data: notifications,
  };
});

export const getAllNotifications = catchAsync(async (req) => {
  const user = req.user as User;
  const { query } = await zParse(getNotificationsSchema, req);
  const notifications = await notificationService.queryAllNotifications(user.id, query);
  return {
    statusCode: httpStatus.OK,
    message: 'Notifications fetched successfully',
    data: notifications,
  };
});

export const markAllNotificationsAsRead = catchAsync(async (req) => {
  const user = req.user as User;
  await notificationService.readAllNotifications(user.id);
  return {
    statusCode: httpStatus.OK,
    message: 'All notifications marked as read',
    data: null,
  };
});

export const markNotificationAsRead = catchAsync(async (req) => {
  const user = req.user as User;
  const { notificationId } = req.params;
  const notification = await notificationService.readNotification(user.id, notificationId);
  return {
    statusCode: httpStatus.OK,
    message: 'Notification marked as read',
    data: notification,
  };
});

export const deleteNotification = catchAsync(async (req) => {
  const user = req.user as User;
  const { notificationId } = req.params;
  await notificationService.deleteNotification(user.id, notificationId);
  return {
    statusCode: httpStatus.OK,
    message: 'Notification deleted',
    data: null,
  };
});

export const deleteAllNotifications = catchAsync(async (req) => {
  const user = req.user as User;
  await notificationService.deleteAllNotifications(user.id);
  return {
    statusCode: httpStatus.OK,
    message: 'All notifications deleted',
    data: null,
  };
});
