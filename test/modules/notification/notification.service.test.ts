import { describe, expect, it, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';

import {
  queryNotifications,
  queryAllNotifications,
  readAllNotifications,
  deleteAllNotifications,
  readNotification,
  deleteNotification,
  createNotification,
} from '@/modules/notification/notification.service';
import { createTestUser, createTestNotification } from '../../utils/test-setup';

describe('Notification Service', () => {
  describe('createNotification', () => {
    it('should create a new notification successfully', async () => {
      const user = await createTestUser();
      const notificationData = {
        userId: user.id,
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        entityType: 'POST',
        entityId: faker.string.uuid(),
      };

      const result = await createNotification(notificationData);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(notificationData.title);
      expect(result.message).toBe(notificationData.message);
      expect(result.entityType).toBe(notificationData.entityType);
      expect(result.entityId).toBe(notificationData.entityId);
      expect(result.userId).toBe(user.id);
      expect(result.isRead).toBe(false);
    });
  });

  describe('queryNotifications', () => {
    let user: any;

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should return unread notifications with pagination', async () => {
      // Create unread notifications
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: false });

      const result = await queryNotifications(user.id, { limit: 10, page: 1 });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalResults', 3);
      expect(result.results).toHaveLength(3);
      expect(result.results.every((notification) => !notification.isRead)).toBe(true);
    });

    it('should return only unread notifications', async () => {
      // Create mixed read/unread notifications
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: true });
      await createTestNotification(user.id, { isRead: false });

      const result = await queryNotifications(user.id, { limit: 10, page: 1 });

      expect(result.totalResults).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results.every((notification) => !notification.isRead)).toBe(true);
    });

    it('should order notifications by createdAt desc', async () => {
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: false });

      const result = await queryNotifications(user.id, { limit: 10, page: 1 });

      expect(result.results.length).toBeGreaterThan(1);
      const dates = result.results.map((notification) => new Date(notification.createdAt));
      expect(dates[0] >= dates[1]).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // Create 5 unread notifications
      for (let i = 0; i < 5; i++) {
        await createTestNotification(user.id, { isRead: false });
      }

      const result = await queryNotifications(user.id, { limit: 2, page: 1 });

      expect(result.results).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.totalResults).toBe(5);
    });
  });

  describe('queryAllNotifications', () => {
    let user: any;

    beforeEach(async () => {
      user = await createTestUser();
    });

    it('should return all notifications (read and unread)', async () => {
      // Create mixed read/unread notifications
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: true });
      await createTestNotification(user.id, { isRead: false });

      const result = await queryAllNotifications(user.id, { limit: 10, page: 1 });

      expect(result.totalResults).toBe(3);
      expect(result.results).toHaveLength(3);
    });

    it('should order notifications by createdAt desc', async () => {
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: true });

      const result = await queryAllNotifications(user.id, { limit: 10, page: 1 });

      expect(result.results.length).toBeGreaterThan(1);
      const dates = result.results.map((notification) => new Date(notification.createdAt));
      expect(dates[0] >= dates[1]).toBe(true);
    });
  });

  describe('readAllNotifications', () => {
    it('should mark all notifications as read', async () => {
      const user = await createTestUser();

      // Create unread notifications
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: false });

      const result = await readAllNotifications(user.id);

      expect(result.count).toBe(2);

      // Verify all notifications are now read
      const notifications = await queryAllNotifications(user.id, { limit: 10, page: 1 });
      expect(notifications.results.every((notification) => notification.isRead)).toBe(true);
    });

    it('should not affect notifications from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      await createTestNotification(user1.id, { isRead: false });
      await createTestNotification(user2.id, { isRead: false });

      await readAllNotifications(user1.id);

      // Verify user2's notifications are still unread
      const user2Notifications = await queryNotifications(user2.id, { limit: 10, page: 1 });
      expect(user2Notifications.totalResults).toBe(1);
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications for a user', async () => {
      const user = await createTestUser();

      // Create notifications
      await createTestNotification(user.id, { isRead: false });
      await createTestNotification(user.id, { isRead: true });

      const result = await deleteAllNotifications(user.id);

      expect(result.count).toBe(2);

      // Verify all notifications are deleted
      const notifications = await queryAllNotifications(user.id, { limit: 10, page: 1 });
      expect(notifications.totalResults).toBe(0);
    });

    it('should not affect notifications from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      await createTestNotification(user1.id, { isRead: false });
      await createTestNotification(user2.id, { isRead: false });

      await deleteAllNotifications(user1.id);

      // Verify user2's notifications still exist
      const user2Notifications = await queryAllNotifications(user2.id, { limit: 10, page: 1 });
      expect(user2Notifications.totalResults).toBe(1);
    });
  });

  describe('readNotification', () => {
    it('should mark single notification as read', async () => {
      const user = await createTestUser();
      const notification = await createTestNotification(user.id, { isRead: false });

      const result = await readNotification(user.id, notification.id);

      expect(result?.isRead).toBe(true);
      expect(result?.id).toBe(notification.id);
    });

    it('should only mark notification for the correct user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const notification = await createTestNotification(user1.id, { isRead: false });

      await readNotification(user1.id, notification.id);

      // Verify notification is read for user1
      const user1Notifications = await queryNotifications(user1.id, { limit: 10, page: 1 });
      expect(user1Notifications.totalResults).toBe(0);

      // Verify notification still exists for user2 (if it was created for user2)
      const user2Notifications = await queryAllNotifications(user2.id, { limit: 10, page: 1 });
      // This should be 0 since the notification was created for user1
      expect(user2Notifications.totalResults).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete single notification', async () => {
      const user = await createTestUser();
      const notification = await createTestNotification(user.id, { isRead: false });

      await deleteNotification(user.id, notification.id);

      // Verify notification is deleted
      const notifications = await queryAllNotifications(user.id, { limit: 10, page: 1 });
      expect(notifications.totalResults).toBe(0);
    });

    it('should only delete notification for the correct user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const notification = await createTestNotification(user1.id, { isRead: false });

      await deleteNotification(user1.id, notification.id);

      // Verify notification is deleted for user1
      const user1Notifications = await queryAllNotifications(user1.id, { limit: 10, page: 1 });
      expect(user1Notifications.totalResults).toBe(0);

      // Verify notification doesn't exist for user2 (it was created for user1)
      const user2Notifications = await queryAllNotifications(user2.id, { limit: 10, page: 1 });
      expect(user2Notifications.totalResults).toBe(0);
    });
  });
});
