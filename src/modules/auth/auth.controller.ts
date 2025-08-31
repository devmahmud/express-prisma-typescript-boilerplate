import { User } from '@prisma/client';
import httpStatus from 'http-status';

import * as emailService from '@/shared/services/email.service';
import * as tokenService from '@/shared/services/token.service';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';

import * as userService from '../user/user.service';
import * as authService from './auth.service';
import * as authSchema from './auth.validation';

export const register = catchAsync(async (req) => {
  const { body } = await zParse(authSchema.registerSchema, req);
  const { email, password, name } = body;
  const user = await userService.createUser(email, password, name);
  const tokens = await tokenService.generateAuthTokens(user);

  // Include name field for register response
  const userWithName = {
    ...user,
    name,
  };

  return {
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: { user: userWithName, tokens },
  };
});

export const login = catchAsync(async (req) => {
  const {
    body: { email, password },
  } = await zParse(authSchema.loginSchema, req);
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  return {
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    data: { user, tokens },
  };
});

export const logout = catchAsync(async (req) => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.logoutSchema, req);
  await authService.logout(refreshToken);
  return {
    statusCode: httpStatus.OK,
    message: 'User logged out successfully',
  };
});

export const refreshTokens = catchAsync(async (req) => {
  const {
    body: { refreshToken },
  } = await zParse(authSchema.refreshTokensSchema, req);
  const tokens = await authService.refreshAuth(refreshToken);
  return {
    statusCode: httpStatus.OK,
    message: 'Tokens refreshed successfully',
    data: tokens,
  };
});

export const forgotPassword = catchAsync(async (req) => {
  const {
    body: { email },
  } = await zParse(authSchema.forgotPasswordSchema, req);
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(email, resetPasswordToken);
  return {
    statusCode: httpStatus.OK,
    message: 'Reset password email sent successfully',
  };
});

export const resetPassword = catchAsync(async (req) => {
  const {
    query: { token },
    body: { password },
  } = await zParse(authSchema.resetPasswordSchema, req);
  await authService.resetPassword(token as string, password);
  return {
    statusCode: httpStatus.OK,
    message: 'Password reset successfully',
  };
});

export const sendVerificationEmail = catchAsync(async (req) => {
  const user = req.user as User;

  if (user.email) {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  }
  return {
    statusCode: httpStatus.OK,
    message: 'Verification email sent successfully',
  };
});

export const verifyEmail = catchAsync(async (req) => {
  const {
    body: { token },
  } = await zParse(authSchema.verifyEmailSchema, req);

  await authService.verifyEmail(token);
  return {
    statusCode: httpStatus.OK,
    message: 'Email verified successfully',
  };
});
