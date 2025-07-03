import { describe, expect, it, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

import {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
} from '@/modules/user/user.service';
import { createTestUser, createFakeUser } from '../../utils/test-setup';
import ApiError from '@/shared/utils/api-error';

describe('User Service', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = createFakeUser();

      const result = await createUser(userData.email, userData.password, userData.name);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result.role).toEqual([Role.USER]);
      expect(result.isEmailVerified).toBe(false);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('name');
    });

    it('should throw error if email already exists', async () => {
      const existingUser = await createTestUser();
      const userData = createFakeUser({ email: existingUser.email });

      await expect(createUser(userData.email, userData.password, userData.name)).rejects.toThrow(
        new ApiError(400, 'Email already taken')
      );
    });

    it('should create user without name', async () => {
      const userData = createFakeUser();

      const result = await createUser(userData.email, userData.password);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
      expect(result).not.toHaveProperty('name');
    });
  });

  describe('queryUsers', () => {
    beforeEach(async () => {
      // Create multiple test users
      await createTestUser();
      await createTestUser();
      await createTestUser();
    });

    it('should return paginated users with default options', async () => {
      const result = await queryUsers({}, {});

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalResults');
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should return users with custom pagination', async () => {
      const result = await queryUsers({}, { page: 1, limit: 2 });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(result.results.length).toBeLessThanOrEqual(2);
    });

    it('should filter users by email', async () => {
      const testUser = await createTestUser();
      const result = await queryUsers({ email: testUser.email }, {});

      expect(result.results).toHaveLength(1);
      expect(result.results[0].email).toBe(testUser.email);
    });

    it('should sort users by createdAt desc by default', async () => {
      const result = await queryUsers({}, { sortBy: 'createdAt' });

      expect(result.results.length).toBeGreaterThan(1);
      const dates = result.results.map((user) => new Date(user.createdAt));
      expect(dates[0] >= dates[1]).toBe(true);
    });

    it('should sort users by createdAt asc', async () => {
      const result = await queryUsers({}, { sortBy: 'createdAt', sortType: 'asc' });

      expect(result.results.length).toBeGreaterThan(1);
      const dates = result.results.map((user) => new Date(user.createdAt));
      expect(dates[0] <= dates[1]).toBe(true);
    });

    it('should return specific user fields', async () => {
      const result = await queryUsers({}, {}, ['id', 'email']);

      expect(result.results[0]).toHaveProperty('id');
      expect(result.results[0]).toHaveProperty('email');
      expect(result.results[0]).not.toHaveProperty('name');
      expect(result.results[0]).not.toHaveProperty('role');
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const testUser = await createTestUser();

      const result = await getUserById(testUser.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
      expect(result?.email).toBe(testUser.email);
    });

    it('should return null for non-existent user', async () => {
      const result = await getUserById(faker.string.uuid());

      expect(result).toBeNull();
    });

    it('should return specific user fields', async () => {
      const testUser = await createTestUser();

      const result = await getUserById(testUser.id, ['id', 'email']);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).not.toHaveProperty('name');
      expect(result).not.toHaveProperty('role');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const testUser = await createTestUser();

      const result = await getUserByEmail(testUser.email);

      expect(result).toBeDefined();
      expect(result?.id).toBe(testUser.id);
      expect(result?.email).toBe(testUser.email);
    });

    it('should return null for non-existent email', async () => {
      const result = await getUserByEmail(faker.internet.email());

      expect(result).toBeNull();
    });

    it('should include password when requested', async () => {
      const testUser = await createTestUser();

      const result = await getUserByEmail(testUser.email, ['id', 'email', 'password']);

      expect(result).toHaveProperty('password');
      expect(result?.password).toBeDefined();
    });
  });

  describe('updateUserById', () => {
    it('should update user successfully', async () => {
      const testUser = await createTestUser();
      const updateData = {
        name: faker.person.fullName(),
        role: [Role.ADMIN],
      };

      const result = await updateUserById(testUser.id, updateData);

      expect(result?.name).toBe(updateData.name);
      expect(result?.role).toEqual(updateData.role);
    });

    it('should throw error for non-existent user', async () => {
      const updateData = { name: faker.person.fullName() };

      await expect(updateUserById(faker.string.uuid(), updateData)).rejects.toThrow(
        new ApiError(404, 'User not found')
      );
    });

    it('should throw error if email already taken', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      await expect(updateUserById(user1.id, { email: user2.email })).rejects.toThrow(
        new ApiError(400, 'Email already taken')
      );
    });

    it('should encrypt password when updating', async () => {
      const testUser = await createTestUser();
      const newPassword = faker.internet.password();

      const result = await updateUserById(testUser.id, { password: newPassword });

      expect(result).toBeDefined();

      // Verify password was encrypted
      const updatedUser = await getUserByEmail(testUser.email, ['password']);
      expect(updatedUser?.password).not.toBe(newPassword);
      expect(updatedUser?.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should return specific fields', async () => {
      const testUser = await createTestUser();
      const updateData = { name: faker.person.fullName() };

      const result = await updateUserById(testUser.id, updateData, ['id', 'name']);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('role');
    });
  });

  describe('deleteUserById', () => {
    it('should delete user successfully', async () => {
      const testUser = await createTestUser();

      const result = await deleteUserById(testUser.id);

      expect(result.id).toBe(testUser.id);

      // Verify user is deleted
      const deletedUser = await getUserById(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should throw error for non-existent user', async () => {
      await expect(deleteUserById(faker.string.uuid())).rejects.toThrow(
        new ApiError(404, 'User not found')
      );
    });
  });
});
