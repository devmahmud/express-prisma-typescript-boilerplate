import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';
import { TokenType } from '@prisma/client';

import * as authService from '@/modules/auth/auth.service';
import {
  createTestUser,
  createTestToken,
  prisma,
  generateJWTToken,
  generateExpiredJWTToken,
} from '../../utils/test-setup';
import { encryptPassword } from '@/shared/utils/encryption';
import ApiError from '@/shared/utils/api-error';

describe('Auth Service', () => {
  describe('loginUserWithEmailAndPassword', () => {
    it('should login user with correct credentials', async () => {
      const password = faker.internet.password({ length: 12 });
      const hashedPassword = await encryptPassword(password);
      const user = await createTestUser({ password: hashedPassword });

      const result = await authService.loginUserWithEmailAndPassword(user.email, password);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error for incorrect email', async () => {
      await expect(
        authService.loginUserWithEmailAndPassword(faker.internet.email(), faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Incorrect email or password'));
    });

    it('should throw error for incorrect password', async () => {
      const user = await createTestUser();

      await expect(
        authService.loginUserWithEmailAndPassword(user.email, faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Incorrect email or password'));
    });

    it('should throw error for user without password', async () => {
      const user = await createTestUser();
      // Update user to remove password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: null },
      });

      await expect(
        authService.loginUserWithEmailAndPassword(user.email, faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Incorrect email or password'));
    });
  });

  describe('logout', () => {
    it('should logout user by deleting refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = await createTestToken(user.id, {
        type: TokenType.REFRESH,
        blacklisted: false,
      });

      await authService.logout(refreshToken.token);

      // Verify token is deleted
      const deletedToken = await prisma.token.findUnique({
        where: { id: refreshToken.id },
      });
      expect(deletedToken).toBeNull();
    });

    it('should throw error for non-existent refresh token', async () => {
      await expect(authService.logout(faker.string.alphanumeric(32))).rejects.toThrow(
        new ApiError(404, 'Not found')
      );
    });

    it('should throw error for blacklisted refresh token', async () => {
      const user = await createTestUser();
      await createTestToken(user.id, {
        type: TokenType.REFRESH,
        blacklisted: true,
      });

      await expect(authService.logout(faker.string.alphanumeric(32))).rejects.toThrow(
        new ApiError(404, 'Not found')
      );
    });

    it('should throw error for non-refresh token', async () => {
      const user = await createTestUser();
      await createTestToken(user.id, {
        type: TokenType.ACCESS,
        blacklisted: false,
      });

      await expect(authService.logout(faker.string.alphanumeric(32))).rejects.toThrow(
        new ApiError(404, 'Not found')
      );
    });
  });

  describe('refreshAuth', () => {
    it('should refresh auth tokens successfully', async () => {
      const user = await createTestUser();
      const jwtToken = generateJWTToken(user.id, TokenType.REFRESH);
      const refreshToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.REFRESH,
          expires: faker.date.future(),
          blacklisted: false,
        },
      });

      const result = await authService.refreshAuth(refreshToken.token);

      expect(result).toHaveProperty('access');
      expect(result).toHaveProperty('refresh');
      expect(result.access).toBeDefined();
      expect(result.refresh).toBeDefined();

      // Verify old refresh token is deleted
      const deletedToken = await prisma.token.findUnique({
        where: { id: refreshToken.id },
      });
      expect(deletedToken).toBeNull();
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshAuth(faker.string.alphanumeric(32))).rejects.toThrow(
        new ApiError(401, 'Please authenticate')
      );
    });

    it('should throw error for expired refresh token', async () => {
      const user = await createTestUser();
      const jwtToken = generateExpiredJWTToken(user.id, TokenType.REFRESH);
      const refreshToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.REFRESH,
          expires: faker.date.past(),
          blacklisted: false,
        },
      });

      await expect(authService.refreshAuth(refreshToken.token)).rejects.toThrow(
        new ApiError(401, 'Please authenticate')
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = await createTestUser();
      const jwtToken = generateJWTToken(user.id, TokenType.RESET_PASSWORD);
      const resetToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.RESET_PASSWORD,
          expires: faker.date.future(),
          blacklisted: false,
        },
      });
      const newPassword = faker.internet.password();

      await authService.resetPassword(resetToken.token, newPassword);

      // Verify password was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });
      expect(updatedUser?.password).not.toBe(newPassword);
      expect(updatedUser?.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);

      // Verify reset tokens are deleted
      const deletedTokens = await prisma.token.findMany({
        where: { userId: user.id, type: TokenType.RESET_PASSWORD },
      });
      expect(deletedTokens).toHaveLength(0);
    });

    it('should throw error for invalid reset token', async () => {
      await expect(
        authService.resetPassword(faker.string.alphanumeric(32), faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Password reset failed'));
    });

    it('should throw error for expired reset token', async () => {
      const user = await createTestUser();
      const jwtToken = generateExpiredJWTToken(user.id, TokenType.RESET_PASSWORD);
      const resetToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.RESET_PASSWORD,
          expires: faker.date.past(),
          blacklisted: false,
        },
      });

      await expect(
        authService.resetPassword(resetToken.token, faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Password reset failed'));
    });

    it('should throw error for non-reset password token', async () => {
      const user = await createTestUser();
      const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);
      const accessToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.ACCESS,
          expires: faker.date.future(),
          blacklisted: false,
        },
      });

      await expect(
        authService.resetPassword(accessToken.token, faker.internet.password())
      ).rejects.toThrow(new ApiError(401, 'Password reset failed'));
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const user = await createTestUser({ isEmailVerified: false });
      const jwtToken = generateJWTToken(user.id, TokenType.VERIFY_EMAIL);
      const verifyToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.VERIFY_EMAIL,
          expires: faker.date.future(),
          blacklisted: false,
        },
      });

      await authService.verifyEmail(verifyToken.token);

      // Verify email is marked as verified
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isEmailVerified: true },
      });
      expect(updatedUser?.isEmailVerified).toBe(true);

      // Verify token is deleted
      const deletedToken = await prisma.token.findUnique({
        where: { id: verifyToken.id },
      });
      expect(deletedToken).toBeNull();
    });

    it('should throw error for invalid verify token', async () => {
      await expect(authService.verifyEmail(faker.string.alphanumeric(32))).rejects.toThrow(
        new ApiError(401, 'Email verification failed')
      );
    });

    it('should throw error for expired verify token', async () => {
      const user = await createTestUser();
      const jwtToken = generateExpiredJWTToken(user.id, TokenType.VERIFY_EMAIL);
      const verifyToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.VERIFY_EMAIL,
          expires: faker.date.past(),
          blacklisted: false,
        },
      });

      await authService.verifyEmail(verifyToken.token);
      await expect(authService.verifyEmail(verifyToken.token)).rejects.toThrow(
        new ApiError(401, 'Email verification failed')
      );
    });

    it('should throw error for non-verify email token', async () => {
      const user = await createTestUser();
      const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);
      const accessToken = await prisma.token.create({
        data: {
          token: jwtToken,
          userId: user.id,
          type: TokenType.ACCESS,
          expires: faker.date.future(),
          blacklisted: false,
        },
      });

      await expect(authService.verifyEmail(accessToken.token)).rejects.toThrow(
        new ApiError(401, 'Email verification failed')
      );
    });
  });
});
