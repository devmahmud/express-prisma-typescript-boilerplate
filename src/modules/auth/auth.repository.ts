import { Prisma, Token, TokenType } from '@prisma/client';
import prisma from '@/client';
import { createBaseRepository } from '@/shared/repositories/base.repository';

export interface TokenCreateInput {
  token: string;
  type: TokenType;
  expires: Date;
  blacklisted: boolean;
  userId: string;
}

export type TokenUpdateInput = Partial<Prisma.TokenUpdateInput>;

export interface AuthRepository {
  // Token operations
  createToken(data: TokenCreateInput): Promise<Token>;
  findTokenById(id: string, select?: Record<string, boolean>): Promise<Token | null>;
  findTokenByToken(token: string, select?: Record<string, boolean>): Promise<Token | null>;
  findTokens(where?: Record<string, any>, select?: Record<string, boolean>): Promise<Token[]>;
  updateToken(
    id: string,
    data: TokenUpdateInput,
    select?: Record<string, boolean>
  ): Promise<Token | null>;
  deleteToken(id: string): Promise<Token | null>;
  countTokens(where?: Record<string, any>): Promise<number>;
  // Auth-specific methods
  deleteTokensByUserId(userId: string): Promise<{ count: number }>;
  deleteTokensByUserIdAndType(userId: string, type: TokenType): Promise<{ count: number }>;
  findValidToken(token: string, type: TokenType): Promise<Token | null>;
}

// Create base repository functions
const baseTokenRepo = createBaseRepository<Token, TokenCreateInput, TokenUpdateInput>(
  prisma,
  'token'
);

// Auth-specific repository functions
export const createToken = async (data: TokenCreateInput): Promise<Token> => {
  return baseTokenRepo.create(data);
};

export const findTokenById = async (
  id: string,
  select?: Record<string, boolean>
): Promise<Token | null> => {
  return baseTokenRepo.findById(id, select);
};

export const findTokenByToken = async (
  token: string,
  select?: Record<string, boolean>
): Promise<Token | null> => {
  return prisma.token.findFirst({
    where: { token },
    select,
  });
};

export const findTokens = async (
  where?: Record<string, any>,
  select?: Record<string, boolean>
): Promise<Token[]> => {
  return prisma.token.findMany({
    where,
    select,
  });
};

export const updateToken = async (
  id: string,
  data: TokenUpdateInput,
  select?: Record<string, boolean>
): Promise<Token | null> => {
  return baseTokenRepo.update(id, data, select);
};

export const deleteToken = async (id: string): Promise<Token | null> => {
  return baseTokenRepo.delete(id);
};

export const countTokens = async (where?: Record<string, any>): Promise<number> => {
  return baseTokenRepo.count(where);
};

// Auth-specific methods
export const deleteTokensByUserId = async (userId: string): Promise<{ count: number }> => {
  return prisma.token.deleteMany({
    where: { userId },
  });
};

export const deleteTokensByUserIdAndType = async (
  userId: string,
  type: TokenType
): Promise<{ count: number }> => {
  return prisma.token.deleteMany({
    where: { userId, type },
  });
};

export const findValidToken = async (token: string, type: TokenType): Promise<Token | null> => {
  return prisma.token.findFirst({
    where: {
      token,
      type,
      blacklisted: false,
      expires: {
        gt: new Date(),
      },
    },
  });
};

// Export the complete auth repository object
export const authRepository: AuthRepository = {
  createToken: createToken,
  findTokenById: findTokenById,
  findTokenByToken: findTokenByToken,
  findTokens: findTokens,
  updateToken: updateToken,
  deleteToken: deleteToken,
  countTokens: countTokens,
  deleteTokensByUserId: deleteTokensByUserId,
  deleteTokensByUserIdAndType: deleteTokensByUserIdAndType,
  findValidToken: findValidToken,
};
