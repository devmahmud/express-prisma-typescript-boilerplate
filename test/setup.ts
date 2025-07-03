import { beforeAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error(
      'Tests must use a test database. Check your DATABASE_URL environment variable.'
    );
  }

  // Set test-specific environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_ACCESS_EXPIRATION_MINUTES = '15';
  process.env.JWT_REFRESH_EXPIRATION_DAYS = '30';
  process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES = '10';
  process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = '10';
});
