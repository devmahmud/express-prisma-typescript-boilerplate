import { TokenType, User } from '@prisma/client';
import httpStatus from 'http-status';

import * as userService from '@/modules/user/user.service';
import * as tokenService from '@/shared/services/token.service';
import ApiError from '@/shared/utils/api-error';
import { isPasswordMatch } from '@/shared/utils/encryption';
import exclude from '@/shared/utils/exclude';
import { AuthTokensResponse } from '@/types/response';
import { authRepository } from './auth.repository';

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
  const refreshTokenDoc = await authRepository.findValidToken(refreshToken, TokenType.REFRESH);
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await authRepository.deleteToken(refreshTokenDoc.id);
};

export const refreshAuth = async (refreshToken: string): Promise<AuthTokensResponse> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, TokenType.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await authRepository.deleteToken(refreshTokenDoc.id);
    const tokens = await tokenService.generateAuthTokens(user);
    return tokens;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
): Promise<void> => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      TokenType.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await authRepository.deleteTokensByUserIdAndType(user.id, TokenType.RESET_PASSWORD);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

export const verifyEmail = async (verifyEmailToken: string): Promise<void> => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      TokenType.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.userId);
    if (!user) {
      throw new Error();
    }
    await authRepository.deleteTokensByUserIdAndType(user.id, TokenType.VERIFY_EMAIL);
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};
