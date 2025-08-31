import { Prisma, Notification } from '@prisma/client';
import prisma from '@/client';
import {
  createBaseRepository,
  PaginationOptions,
  PaginatedResult,
} from '@/shared/repositories/base.repository';

export interface NotificationCreateInput {
  userId: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead?: boolean;
}

export type NotificationUpdateInput = Partial<Prisma.NotificationUpdateInput>;

export interface NotificationRepository {
  create(data: NotificationCreateInput): Promise<Notification>;
  findById(id: string, select?: Record<string, boolean>): Promise<Notification | null>;
  findMany(
    where?: Record<string, any>,
    options?: PaginationOptions,
    select?: Record<string, boolean>
  ): Promise<PaginatedResult<Notification>>;
  update(
    id: string,
    data: NotificationUpdateInput,
    select?: Record<string, boolean>
  ): Promise<Notification | null>;
  delete(id: string): Promise<Notification | null>;
  count(where?: Record<string, any>): Promise<number>;
  // Notification-specific methods
  findUnreadByUserId(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification>>;
  findAllByUserId(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification>>;
  readAllByUserId(userId: string): Promise<{ count: number }>;
  deleteAllByUserId(userId: string): Promise<{ count: number }>;
  readById(userId: string, notificationId: string): Promise<Notification | null>;
  deleteById(userId: string, notificationId: string): Promise<Notification | null>;
}

// Create base repository functions
const baseNotificationRepo = createBaseRepository<
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput
>(prisma, 'notification');

// Notification-specific repository functions
export const createNotification = async (data: NotificationCreateInput): Promise<Notification> => {
  return baseNotificationRepo.create(data);
};

export const findNotificationById = async (
  id: string,
  select?: Record<string, boolean>
): Promise<Notification | null> => {
  return baseNotificationRepo.findById(id, select);
};

export const findNotifications = async (
  where?: Record<string, any>,
  options?: PaginationOptions,
  select?: Record<string, boolean>
): Promise<PaginatedResult<Notification>> => {
  return baseNotificationRepo.findMany(where, options, select);
};

export const updateNotification = async (
  id: string,
  data: NotificationUpdateInput,
  select?: Record<string, boolean>
): Promise<Notification | null> => {
  return baseNotificationRepo.update(id, data, select);
};

export const deleteNotification = async (id: string): Promise<Notification | null> => {
  return baseNotificationRepo.delete(id);
};

export const countNotifications = async (where?: Record<string, any>): Promise<number> => {
  return baseNotificationRepo.count(where);
};

// Notification-specific methods
export const findUnreadNotificationsByUserId = async (
  userId: string,
  options?: PaginationOptions
): Promise<PaginatedResult<Notification>> => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  const totalCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  const totalPages = Math.ceil(totalCount / limit);

  const results = await prisma.notification.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId, isRead: false },
    select: {
      id: true,
      title: true,
      message: true,
      isRead: true,
      createdAt: true,
      userId: true,
      entityType: true,
      entityId: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

export const findAllNotificationsByUserId = async (
  userId: string,
  options?: PaginationOptions
): Promise<PaginatedResult<Notification>> => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  const totalCount = await prisma.notification.count({
    where: { userId },
  });
  const totalPages = Math.ceil(totalCount / limit);

  const results = await prisma.notification.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

export const readAllNotificationsByUserId = async (userId: string): Promise<{ count: number }> => {
  return prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true },
  });
};

export const deleteAllNotificationsByUserId = async (
  userId: string
): Promise<{ count: number }> => {
  return prisma.notification.deleteMany({
    where: { userId },
  });
};

export const readNotificationById = async (
  userId: string,
  notificationId: string
): Promise<Notification | null> => {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

export const deleteNotificationById = async (
  userId: string,
  notificationId: string
): Promise<Notification | null> => {
  return prisma.notification.delete({
    where: { id: notificationId, userId },
  });
};

// Export the complete notification repository object
export const notificationRepository: NotificationRepository = {
  create: createNotification,
  findById: findNotificationById,
  findMany: findNotifications,
  update: updateNotification,
  delete: deleteNotification,
  count: countNotifications,
  findUnreadByUserId: findUnreadNotificationsByUserId,
  findAllByUserId: findAllNotificationsByUserId,
  readAllByUserId: readAllNotificationsByUserId,
  deleteAllByUserId: deleteAllNotificationsByUserId,
  readById: readNotificationById,
  deleteById: deleteNotificationById,
};
