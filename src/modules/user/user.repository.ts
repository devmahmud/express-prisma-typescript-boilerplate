import { Prisma, User, Role } from '@prisma/client';
import prisma from '@/client';
import {
  createBaseRepository,
  PaginationOptions,
  PaginatedResult,
} from '@/shared/repositories/base.repository';

export interface UserCreateInput {
  email: string;
  name?: string;
  password: string;
  role?: Role[];
  isEmailVerified?: boolean;
}

export type UserUpdateInput = Partial<Prisma.UserUpdateInput>;

export interface UserRepository {
  create(data: UserCreateInput): Promise<Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'>>;
  findById(id: string, select?: Record<string, boolean>): Promise<User | null>;
  findByEmail(email: string, select?: Record<string, boolean>): Promise<User | null>;
  findMany(
    where?: Record<string, any>,
    options?: PaginationOptions,
    select?: Record<string, boolean>
  ): Promise<PaginatedResult<User>>;
  update(id: string, data: UserUpdateInput, select?: Record<string, boolean>): Promise<User | null>;
  delete(id: string): Promise<User | null>;
  count(where?: Record<string, any>): Promise<number>;
}

// Create base repository functions
const baseUserRepo = createBaseRepository<User, UserCreateInput, UserUpdateInput>(prisma, 'user');

// User-specific repository functions
export const createUser = async (
  data: UserCreateInput
): Promise<Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'>> => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      role: true,
      isEmailVerified: true,
    },
  });
};

export const findUserById = async (
  id: string,
  select?: Record<string, boolean>
): Promise<User | null> => {
  return baseUserRepo.findById(id, select);
};

export const findUserByEmail = async (
  email: string,
  select?: Record<string, boolean>
): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
    select,
  });
};

export const findUsers = async (
  where?: Record<string, any>,
  options?: PaginationOptions,
  select?: Record<string, boolean>
): Promise<PaginatedResult<User>> => {
  return baseUserRepo.findMany(where, options, select);
};

export const updateUser = async (
  id: string,
  data: UserUpdateInput,
  select?: Record<string, boolean>
): Promise<User | null> => {
  return baseUserRepo.update(id, data, select);
};

export const deleteUser = async (id: string): Promise<User | null> => {
  return baseUserRepo.delete(id);
};

export const countUsers = async (where?: Record<string, any>): Promise<number> => {
  return baseUserRepo.count(where);
};

// Export the complete user repository object
export const userRepository: UserRepository = {
  create: createUser,
  findById: findUserById,
  findByEmail: findUserByEmail,
  findMany: findUsers,
  update: updateUser,
  delete: deleteUser,
  count: countUsers,
};
