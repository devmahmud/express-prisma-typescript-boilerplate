import { Token, TokenType } from '@prisma/client';
import { add, getUnixTime } from 'date-fns';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';

import config from '@/config/config';
import * as userService from '@/modules/user/user.service';
import ApiError from '@/shared/utils/api-error';
import { AuthTokensResponse } from '@/types/response';
import { authRepository } from '@/modules/auth/auth.repository';

/**
 * Generate token
 * @param {string} userId
 * @param {Date} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
export const generateToken = (
  userId: string,
  expires: Date,
  type: TokenType,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: userId,
    iat: getUnixTime(new Date()),
    exp: getUnixTime(expires),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {number} userId
 * @param {Date} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
export const saveToken = async (
  token: string,
  userId: string,
  expires: Date,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  return authRepository.createToken({
    token,
    userId,
    expires,
    type,
    blacklisted,
  });
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
export const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const userId = String(payload.sub);
  const tokenData = await authRepository.findValidToken(token, type);
  if (!tokenData || tokenData.userId !== userId) {
    throw new Error('Token not found');
  }
  return tokenData;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<AuthTokensResponse>}
 */
export const generateAuthTokens = async (user: { id: string }): Promise<AuthTokensResponse> => {
  const accessTokenExpires = add(new Date(), { minutes: config.jwt.accessExpirationMinutes });
  const accessToken = generateToken(user.id, accessTokenExpires, TokenType.ACCESS);

  const refreshTokenExpires = add(new Date(), { days: config.jwt.refreshExpirationDays });
  const refreshToken = generateToken(user.id, refreshTokenExpires, TokenType.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, TokenType.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires,
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires,
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
export const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = add(new Date(), { minutes: config.jwt.resetPasswordExpirationMinutes });
  const resetPasswordToken = generateToken(user.id as string, expires, TokenType.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id as string, expires, TokenType.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
export const generateVerifyEmailToken = async (user: { id: string }): Promise<string> => {
  const expires = add(new Date(), { minutes: config.jwt.verifyEmailExpirationMinutes });
  const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
  return verifyEmailToken;
};
