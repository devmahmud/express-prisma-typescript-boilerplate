import { Role } from '@prisma/client';
import z from 'zod';
import { password } from './custom.validation';

const createUser = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().min(1),
    role: z.enum([Role.USER, Role.ADMIN]),
  }),
});

// const getUsers = {
//   query: Joi.object().keys({
//     name: Joi.string(),
//     role: Joi.string(),
//     sortBy: Joi.string(),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//   }),
// };

// const getUser = {
//   params: Joi.object().keys({
//     userId: Joi.number().integer(),
//   }),
// };

// const updateUser = {
//   params: Joi.object().keys({
//     userId: Joi.number().integer(),
//   }),
//   body: Joi.object()
//     .keys({
//       email: Joi.string().email(),
//       password: Joi.string().custom(password),
//       name: Joi.string(),
//     })
//     .min(1),
// };

// const deleteUser = {
//   params: Joi.object().keys({
//     userId: Joi.number().integer(),
//   }),
// };

export default {
  createUser,
  // getUsers,
  // getUser,
  // updateUser,
  // deleteUser,
};
