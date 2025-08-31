import { Notification } from '@prisma/client';
import { notificationRepository } from './notification.repository';

export const queryNotifications = async (
  userId: string,
  options: { limit?: number; page?: number }
) => {
  return notificationRepository.findUnreadByUserId(userId, options);
};

export const queryAllNotifications = async (
  userId: string,
  options: { limit?: number; page?: number }
) => {
  return notificationRepository.findAllByUserId(userId, options);
};

// Read all notifications for a user
export const readAllNotifications = async (userId: string) => {
  return notificationRepository.readAllByUserId(userId);
};

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: string) => {
  return notificationRepository.deleteAllByUserId(userId);
};

// Read single notification for a user
export const readNotification = async (userId: string, notificationId: string) => {
  return notificationRepository.readById(userId, notificationId);
};

// Delete single notification for a user
export const deleteNotification = async (userId: string, notificationId: string) => {
  return notificationRepository.deleteById(userId, notificationId);
};

// Create notification
export const createNotification = async (
  notification: Pick<Notification, 'userId' | 'title' | 'message' | 'entityType' | 'entityId'>
) => {
  return notificationRepository.create(notification);
};
