import { PrismaClient, Role, TokenType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { add } from 'date-fns';

export const prisma = new PrismaClient();

// Test database setup
beforeAll(async () => {
  // Ensure we're using test database
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test');
  }

  // Clean database before all tests
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase();
});

afterEach(async () => {
  // Clean database after each test
  await cleanDatabase();
});

async function cleanDatabase() {
  try {
    // Use a more robust cleanup approach with explicit error handling
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      await tx.token.deleteMany({});
      await tx.notification.deleteMany({});
      await tx.comment.deleteMany({});
      await tx.post.deleteMany({});
      await tx.user.deleteMany({});
    });
  } catch (error) {
    console.error('Database cleanup error:', error);
    // Try individual deletes if transaction fails
    try {
      await prisma.token.deleteMany({});
      await prisma.notification.deleteMany({});
      await prisma.comment.deleteMany({});
      await prisma.post.deleteMany({});
      await prisma.user.deleteMany({});
    } catch (individualError) {
      console.error('Individual cleanup error:', individualError);
    }
  }
}

// Faker utilities for creating test data
export const createFakeUser = (overrides: Partial<any> = {}) => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  password: faker.internet.password({ length: 12 }),
  role: [Role.USER],
  isEmailVerified: faker.datatype.boolean(),
  ...overrides,
});

export const createFakePost = (overrides: Partial<any> = {}) => ({
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(3),
  published: faker.datatype.boolean(),
  ...overrides,
});

export const createFakeComment = (overrides: Partial<any> = {}) => ({
  content: faker.lorem.paragraph(),
  ...overrides,
});

export const createFakeNotification = (overrides: Partial<any> = {}) => ({
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  entityType: faker.helpers.arrayElement(['POST', 'COMMENT', 'USER']),
  entityId: faker.string.uuid(),
  isRead: faker.datatype.boolean(),
  ...overrides,
});

export const createFakeToken = (overrides: Partial<any> = {}) => ({
  token: faker.string.alphanumeric(32),
  type: faker.helpers.arrayElement(['ACCESS', 'REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL']),
  expires: faker.date.future(),
  blacklisted: faker.datatype.boolean(),
  ...overrides,
});

// Helper functions for creating test data in database
export const createTestUser = async (overrides: Partial<any> = {}) => {
  const userData = createFakeUser(overrides);
  return await prisma.user.create({
    data: userData,
  });
};

export const createTestPost = async (authorId: string, overrides: Partial<any> = {}) => {
  const postData = createFakePost(overrides);
  return await prisma.post.create({
    data: {
      ...postData,
      authorId,
    },
  });
};

export const createTestComment = async (
  authorId: string,
  postId: string,
  overrides: Partial<any> = {}
) => {
  const commentData = createFakeComment(overrides);
  return await prisma.comment.create({
    data: {
      ...commentData,
      authorId,
      postId,
    },
  });
};

export const createTestNotification = async (userId: string, overrides: Partial<any> = {}) => {
  const notificationData = createFakeNotification(overrides);
  return await prisma.notification.create({
    data: {
      ...notificationData,
      userId,
    },
  });
};

// Helper to generate JWT token
export const generateJWTToken = (userId: string, type: TokenType = TokenType.ACCESS) => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret';
  const expires = add(new Date(), { minutes: 15 });

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.getTime() / 1000),
    type,
  };

  return jwt.sign(payload, secret);
};

// Helper to generate expired JWT token
export const generateExpiredJWTToken = (userId: string, type: TokenType = TokenType.ACCESS) => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret';
  const expires = add(new Date(), { minutes: -15 }); // Expired 15 minutes ago

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.getTime() / 1000),
    type,
  };

  return jwt.sign(payload, secret);
};

// Helper to create a token in database
export const createTestToken = async (userId: string, overrides: Partial<any> = {}) => {
  const tokenData = createFakeToken(overrides);
  return await prisma.token.create({
    data: {
      ...tokenData,
      userId,
    },
  });
};

// Helper for creating authenticated user with JWT token
export const createAuthenticatedUser = async (overrides: Partial<any> = {}) => {
  const user = await createTestUser(overrides);
  const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);

  // Save the JWT token to database
  await prisma.token.create({
    data: {
      token: jwtToken,
      userId: user.id,
      type: TokenType.ACCESS,
      expires: add(new Date(), { minutes: 15 }),
      blacklisted: false,
    },
  });

  return { user, token: { token: jwtToken } };
};

// Helper for creating admin user
export const createAdminUser = async (overrides: Partial<any> = {}) => {
  return await createTestUser({
    role: [Role.ADMIN],
    ...overrides,
  });
};

// Helper for creating admin user with JWT token
export const createAuthenticatedAdminUser = async (overrides: Partial<any> = {}) => {
  const user = await createAdminUser(overrides);
  const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);

  // Save the JWT token to database
  await prisma.token.create({
    data: {
      token: jwtToken,
      userId: user.id,
      type: TokenType.ACCESS,
      expires: add(new Date(), { minutes: 15 }),
      blacklisted: false,
    },
  });

  return { user, token: { token: jwtToken } };
};
