import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import pick from '@/shared/utils/pick';
import { zParse } from '@/shared/utils/z-parse';

import * as userService from './user.service';
import { getUserSchema, getUsersSchema } from './user.validation';

export const getUsers = catchAsync(async (req) => {
  const { query } = await zParse(getUsersSchema, req);

  const filter = pick(query, ['name', 'role']);
  const options = pick(query, ['sortBy', 'sortOrder', 'limit', 'page']);

  const result = await userService.queryUsers(filter, options);
  return {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result,
  };
});

export const getUser = catchAsync(async (req) => {
  const { params } = await zParse(getUserSchema, req);
  const user = await userService.getUserById(params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return {
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: user,
  };
});
