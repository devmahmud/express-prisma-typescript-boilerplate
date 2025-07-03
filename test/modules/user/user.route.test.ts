import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import app from '@/app';
import {
  createTestUser,
  createAuthenticatedUser,
  createAuthenticatedAdminUser,
} from '../../utils/test-setup';

describe('User Routes', () => {
  describe('POST /v1/users', () => {
    it('should create a new user successfully', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      const response = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${token.token}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate email', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const existingUser = await createTestUser();
      const userData = {
        email: existingUser.email,
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      const response = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${token.token}`)
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Email already taken');
    });

    it('should return 400 for invalid email format', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const userData = {
        email: 'invalid-email',
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${token.token}`)
        .send(userData)
        .expect(400);
    });

    it('should return 400 for weak password', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const userData = {
        email: faker.internet.email(),
        password: '123',
        name: faker.person.fullName(),
      };

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${token.token}`)
        .send(userData)
        .expect(400);
    });
  });

  describe('GET /v1/users', () => {
    it('should return paginated users for admin', async () => {
      const { token } = await createAuthenticatedAdminUser();
      await createTestUser();
      await createTestUser();

      const response = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data.results).toBeInstanceOf(Array);
      expect(response.body.data.results.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-admin users', async () => {
      const { token } = await createAuthenticatedUser();

      await request(app).get('/v1/users').set('Authorization', `Bearer ${token.token}`).expect(403);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app).get('/v1/users').expect(401);
    });

    it('should handle pagination parameters', async () => {
      const { token } = await createAuthenticatedAdminUser();
      await createTestUser();
      await createTestUser();

      const response = await request(app)
        .get('/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.results.length).toBeLessThanOrEqual(2);
    });

    it('should filter users by email', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const regularUser = await createTestUser();

      const response = await request(app)
        .get(`/v1/users?email=${regularUser.email}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].email).toBe(regularUser.email);
    });
  });

  describe('GET /v1/users/:userId', () => {
    it('should return user by id for admin', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const user = await createTestUser();

      const response = await request(app)
        .get(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createAuthenticatedAdminUser();

      await request(app)
        .get(`/v1/users/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(404);
    });

    it('should return 403 for non-admin users', async () => {
      const { token } = await createAuthenticatedUser();
      const user = await createTestUser();

      await request(app)
        .get(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(403);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const user = await createTestUser();

      await request(app).get(`/v1/users/${user.id}`).expect(401);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    it('should update user successfully for admin', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const user = await createTestUser();
      const updateData = {
        name: faker.person.fullName(),
      };

      const response = await request(app)
        .patch(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 400 for duplicate email', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const updateData = {
        email: user2.email,
      };

      const response = await request(app)
        .patch(`/v1/users/${user1.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Email already taken');
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const updateData = {
        name: faker.person.fullName(),
      };

      await request(app)
        .patch(`/v1/users/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token.token}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 403 for non-admin users', async () => {
      const { token } = await createAuthenticatedUser();
      const user = await createTestUser();
      const updateData = {
        name: faker.person.fullName(),
      };

      await request(app)
        .patch(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    it('should delete user successfully for admin', async () => {
      const { token } = await createAuthenticatedAdminUser();
      const user = await createTestUser();

      const response = await request(app)
        .delete(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createAuthenticatedAdminUser();

      await request(app)
        .delete(`/v1/users/${faker.string.uuid()}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(404);
    });

    it('should return 403 for non-admin users', async () => {
      const { token } = await createAuthenticatedUser();
      const user = await createTestUser();

      await request(app)
        .delete(`/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${token.token}`)
        .expect(403);
    });
  });
});
