import { Prisma, User } from '@prisma/client';
import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import { encryptPassword } from '@/shared/utils/encryption';
import { userRepository } from './user.repository';

export const createUser = async (
  email: string,
  password: string,
  name?: string
): Promise<Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'>> => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  return userRepository.create({
    email,
    name,
    password: await encryptPassword(password),
  });
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
  const select = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});

  const result = await userRepository.findMany(filter, options, select);

  return {
    ...result,
    results: result.results as Pick<User, Key>[],
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
  const select = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  return userRepository.findById(id, select) as Promise<Pick<User, Key> | null>;
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
  const select = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  return userRepository.findByEmail(email, select) as Promise<Pick<User, Key> | null>;
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

  const select = keys.reduce((obj, k) => ({ ...obj, [k]: true }), {});
  return userRepository.update(userId, updateBody, select) as Promise<Pick<User, Key> | null>;
};

export const deleteUserById = async (userId: string): Promise<User> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await userRepository.delete(userId);
  return user as User;
};
