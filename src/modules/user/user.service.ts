import { Prisma, User } from '@prisma/client';
import httpStatus from 'http-status';

import prisma from '@/client';
import ApiError from '@/shared/utils/api-error';
import { encryptPassword } from '@/shared/utils/encryption';

export const createUser = async (
  email: string,
  password: string,
  name?: string
): Promise<Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'>> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const result = await prisma.user.create({
    data: {
      email,
      name,
      password: await encryptPassword(password),
    },
    select: {
      id: true,
      email: true,
      role: true,
      isEmailVerified: true,
    },
  });

  return result;
};

export const queryUsers = async <Key extends keyof User>(
  filter: object,
  options: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  },
  keys: Key[] = [
    'id',
    'email',
    'name',
    'role',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[]
) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';

  const totalCount = await prisma.user.count({ where: filter });
  const totalPages = Math.ceil(totalCount / limit);

  const users = await prisma.user.findMany({
    where: filter,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined,
  });

  return {
    results: users as Pick<User, Key>[],
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

export const getUserById = async <Key extends keyof User>(
  id: string,
  keys: Key[] = [
    'id',
    'email',
    'name',
    'role',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

export const getUserByEmail = async <Key extends keyof User>(
  email: string,
  keys: Key[] = [
    'id',
    'email',
    'name',
    'password',
    'role',
    'isEmailVerified',
    'createdAt',
    'updatedAt',
  ] as Key[]
): Promise<Pick<User, Key> | null> => {
  return prisma.user.findUnique({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<User, Key> | null>;
};

export const updateUserById = async <Key extends keyof User>(
  userId: string,
  updateBody: Prisma.UserUpdateInput,
  keys: Key[] = ['id', 'email', 'name', 'role'] as Key[]
): Promise<Pick<User, Key> | null> => {
  const user = await getUserById(userId, ['id', 'email', 'name']);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await getUserByEmail(updateBody.email as string))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.password) {
    updateBody.password = await encryptPassword(updateBody.password as string);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateBody,
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  });
  return updatedUser as Pick<User, Key> | null;
};

export const deleteUserById = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await prisma.user.delete({ where: { id: userId } });
  return user as User;
};
