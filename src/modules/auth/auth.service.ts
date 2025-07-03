import { TokenType, User } from '@prisma/client';
import httpStatus from 'http-status';

import prisma from '@/client';
import * as userService from '@/modules/user/user.service';
import * as tokenService from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import { isPasswordMatch } from '@/shared/utils/encryption';
import exclude from '@/shared/utils/exclude';
import { AuthTokensResponse } from '@/types/response';

export const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<Pick<User, 'id' | 'email' | 'role' | 'isEmailVerified'>> => {
  const user = await userService.getUserByEmail(email, [
    'id',
    'email',
    'name',
    'password',
    'role',
    'isEmailVerified',
  ]);

  if (!user || !user.password || !(await isPasswordMatch(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return exclude(user, ['password']);
};

export const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

export const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenData = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const { userId } = refreshTokenData;
    await prisma.token.delete({ where: { id: refreshTokenData.id } });
    return tokenService.generateAuthTokens({ id: userId });
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  try {
    const resetPasswordTokenData = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenData.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await userService.updateUserById(user.id, { password: newPassword });
    await prisma.token.deleteMany({ where: { userId: user.id, type: TokenType.RESET_PASSWORD } });
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

export const verifyEmail = async (token: string, userId: string): Promise<void> => {
  try {
    const tokenData = await tokenService.verifyToken(token, TokenType.VERIFY_EMAIL);
    await prisma.token.delete({ where: { id: tokenData.id } });
    await userService.updateUserById(userId, { isEmailVerified: true });
  } catch (_error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};
