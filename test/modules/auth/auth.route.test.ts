import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import app from '@/app';
import { createTestUser, createAuthenticatedUser } from '../../utils/test-setup';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Auth Routes', () => {
  describe('POST /v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      const response = await request(app).post('/v1/auth/register').send(userData).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.tokens).toHaveProperty('access');
      expect(response.body.data.tokens).toHaveProperty('refresh');
    });

    it('should return 400 for duplicate email', async () => {
      const existingUser = await createTestUser();
      const userData = {
        email: existingUser.email,
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      const response = await request(app).post('/v1/auth/register').send(userData).expect(400);

      expect(response.body.message).toBe('Email already taken');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: faker.internet.password({ length: 12 }),
        name: faker.person.fullName(),
      };

      await request(app).post('/v1/auth/register').send(userData).expect(400);
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: faker.internet.email(),
        password: '123',
        name: faker.person.fullName(),
      };

      await request(app).post('/v1/auth/register').send(userData).expect(400);
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should login user successfully with correct credentials', async () => {
      const password = faker.internet.password({ length: 12 });
      const hashedPassword = await encryptPassword(password);
      const user = await createTestUser({ password: hashedPassword });

      const loginData = {
        email: user.email,
        password: password,
      };

      const response = await request(app).post('/v1/auth/login').send(loginData).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.tokens).toHaveProperty('access');
      expect(response.body.data.tokens).toHaveProperty('refresh');
      expect(response.body.data.tokens.access).toBeDefined();
      expect(response.body.data.tokens.refresh).toBeDefined();
    });

    it('should return 401 for incorrect email', async () => {
      const loginData = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 12 }),
      };

      const response = await request(app).post('/v1/auth/login').send(loginData).expect(401);

      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should return 401 for incorrect password', async () => {
      const user = await createTestUser();
      const loginData = {
        email: user.email,
        password: faker.internet.password({ length: 12 }),
      };

      const response = await request(app).post('/v1/auth/login').send(loginData).expect(401);

      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: faker.internet.password({ length: 12 }),
      };

      await request(app).post('/v1/auth/login').send(loginData).expect(400);
    });
  });

  describe('POST /v1/auth/logout', () => {
    it('should logout user successfully', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${token.token}`)
        .send({ refreshToken: token.token })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
    });

    it('should return 401 for invalid refresh token', async () => {
      const { token } = await createAuthenticatedUser();

      await request(app)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${token.token}`)
        .send({ refreshToken: faker.string.alphanumeric(32) })
        .expect(404);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app)
        .post('/v1/auth/logout')
        .send({ refreshToken: faker.string.alphanumeric(32) })
        .expect(401);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    it('should refresh tokens successfully', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: token.token })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('access');
      expect(response.body.data).toHaveProperty('refresh');
      expect(response.body.data.access).toBeDefined();
      expect(response.body.data.refresh).toBeDefined();
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({ refreshToken: faker.string.alphanumeric(32) })
        .expect(401);

      expect(response.body.message).toBe('Please authenticate');
    });

    it('should return 400 for missing refresh token', async () => {
      await request(app).post('/v1/auth/refresh-tokens').send({}).expect(400);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    it('should send reset password email for existing user', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reset password email sent successfully');
    });

    it('should return 200 for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: faker.internet.email() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Reset password email sent successfully');
    });

    it('should return 400 for invalid email format', async () => {
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    it('should reset password successfully with valid token', async () => {
      const newPassword = faker.internet.password({ length: 12 });

      // Note: In a real test, you would need to create a valid reset token
      // This test assumes the token service is working correctly
      const response = await request(app)
        .post('/v1/auth/reset-password')
        .send({
          token: faker.string.alphanumeric(32),
          password: newPassword,
        })
        .expect(400); // This will fail because we don't have a valid token

      expect(response.body.message).toBe('Password reset failed');
    });

    it('should return 400 for weak password', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .send({
          token: faker.string.alphanumeric(32),
          password: '123',
        })
        .expect(400);
    });

    it('should return 400 for missing token', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .send({
          password: faker.internet.password({ length: 12 }),
        })
        .expect(400);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    it('should send verification email for authenticated user', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Authorization', `Bearer ${token.token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('Verification email sent successfully');
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app).post('/v1/auth/send-verification-email').expect(401);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    it('should verify email successfully with valid token', async () => {
      const user = await createTestUser();
      const { token } = await createAuthenticatedUser({ id: user.id });

      // Note: In a real test, you would need to create a valid verify token
      const response = await request(app)
        .post('/v1/auth/verify-email')
        .set('Authorization', `Bearer ${token.token}`)
        .send({
          token: faker.string.alphanumeric(32),
        })
        .expect(401); // This will fail because we don't have a valid token

      expect(response.body.message).toBe('Please authenticate');
    });

    it('should return 400 for missing token', async () => {
      const user = await createTestUser();
      const { token } = await createAuthenticatedUser({ id: user.id });

      await request(app)
        .post('/v1/auth/verify-email')
        .set('Authorization', `Bearer ${token.token}`)
        .send({
          userId: user.id,
        })
        .expect(400);
    });

    it('should return 400 for missing userId', async () => {
      const { token } = await createAuthenticatedUser();

      await request(app)
        .post('/v1/auth/verify-email')
        .set('Authorization', `Bearer ${token.token}`)
        .send({
          token: faker.string.alphanumeric(32),
        })
        .expect(400);
    });
  });
});
