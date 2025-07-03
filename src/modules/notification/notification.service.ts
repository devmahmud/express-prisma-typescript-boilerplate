import { Notification } from '@prisma/client';

import prisma from '@/client';

export const queryNotifications = async (
  userId: string,
  options: { limit?: number; page?: number }
) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const totalCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  const totalPages = Math.ceil(totalCount / limit);

  const notifications = await prisma.notification.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId, isRead: false },
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
      entityType: true,
      entityId: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    results: notifications,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

export const queryAllNotifications = async (
  userId: string,
  options: { limit?: number; page?: number }
) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const totalCount = await prisma.notification.count({
    where: { userId },
  });
  const totalPages = Math.ceil(totalCount / limit);

  const notifications = await prisma.notification.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    results: notifications,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

// Read all notifications for a user
export const readAllNotifications = async (userId: string) => {
  return prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
};

// Delete all notifications for a user
export const deleteAllNotifications = async (userId: string) => {
  return prisma.notification.deleteMany({
    where: { userId },
  });
};

// Read single notification for a user
export const readNotification = async (userId: string, notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

// Delete single notification for a user
export const deleteNotification = async (userId: string, notificationId: string) => {
  return prisma.notification.delete({
    where: { id: notificationId, userId },
  });
};

// Create notification
export const createNotification = async (
  notification: Pick<Notification, 'userId' | 'title' | 'message' | 'entityType' | 'entityId'>
) => {
  return prisma.notification.create({
    data: notification,
  });
};
