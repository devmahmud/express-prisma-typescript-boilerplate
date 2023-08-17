import jwt from 'jsonwebtoken';
import { add, getUnixTime } from 'date-fns';
import httpStatus from 'http-status';
import config from '@/config/config';
import userService from './user.service';
import ApiError from '@/utils/ApiError';
import { Token, TokenType } from '@prisma/client';
import prisma from '@/client';
import { AuthTokensResponse } from '@/types/response';

/**
 * Generate token
 * @param {number} userId
 * @param {Date} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  userId: number,
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
const saveToken = async (
  token: string,
  userId: number,
  expires: Date,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  const createdToken = prisma.token.create({
    data: {
      token,
      userId,
      expires,
      type,
      blacklisted,
    },
  });
  return createdToken;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const userId = Number(payload.sub);
  const tokenData = await prisma.token.findFirst({
    where: { token, type, userId, blacklisted: false },
  });
  if (!tokenData) {
    throw new Error('Token not found');
  }
  return tokenData;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<AuthTokensResponse>}
 */
const generateAuthTokens = async (user: { id: number }): Promise<AuthTokensResponse> => {
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
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = add(new Date(), { minutes: config.jwt.resetPasswordExpirationMinutes });
  const resetPasswordToken = generateToken(user.id as number, expires, TokenType.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id as number, expires, TokenType.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: { id: number }): Promise<string> => {
  const expires = add(new Date(), { minutes: config.jwt.verifyEmailExpirationMinutes });
  const verifyEmailToken = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
  return verifyEmailToken;
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
