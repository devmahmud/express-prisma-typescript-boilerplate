import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import { encryptPassword, isPasswordMatch } from '@/shared/utils/encryption';

describe('Encryption Utils', () => {
  describe('encryptPassword', () => {
    it('should encrypt password successfully', async () => {
      const password = faker.internet.password();

      const hashedPassword = await encryptPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should generate different hashes for same password', async () => {
      const password = faker.internet.password();

      const hash1 = await encryptPassword(password);
      const hash2 = await encryptPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hashedPassword = await encryptPassword('');

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe('');
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });

    it('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      const hashedPassword = await encryptPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });
  });

  describe('isPasswordMatch', () => {
    it('should return true for matching password', async () => {
      const password = faker.internet.password();
      const hashedPassword = await encryptPassword(password);

      const result = await isPasswordMatch(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = faker.internet.password();
      const wrongPassword = faker.internet.password();
      const hashedPassword = await encryptPassword(password);

      const result = await isPasswordMatch(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = faker.internet.password();
      const hashedPassword = await encryptPassword(password);

      const result = await isPasswordMatch('', hashedPassword);

      expect(result).toBe(false);
    });

    it('should return false for null password', async () => {
      const password = faker.internet.password();
      const hashedPassword = await encryptPassword(password);

      // Test with null password - should handle gracefully
      await expect(isPasswordMatch(null as any, hashedPassword)).rejects.toThrow();
    });

    it('should handle special characters correctly', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hashedPassword = await encryptPassword(password);

      const result = await isPasswordMatch(password, hashedPassword);

      expect(result).toBe(true);
    });
  });
});
