import { add } from 'date-fns';
import { TokenType } from '@prisma/client';
import config from '@/config/config';
import { tokenService } from '@/services';
import { userOne, admin } from './user.fixture';

export const accessTokenExpires = add(new Date(), { minutes: config.jwt.accessExpirationMinutes });
export const userOneAccessToken = tokenService.generateToken(
  userOne.id,
  accessTokenExpires,
  TokenType.ACCESS
);
export const adminAccessToken = tokenService.generateToken(
  admin.id,
  accessTokenExpires,
  TokenType.ACCESS
);
