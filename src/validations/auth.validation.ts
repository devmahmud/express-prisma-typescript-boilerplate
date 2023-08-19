import { z } from 'zod';

const register = z.object({
  body: z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, 'password must be at least 8 characters')
      .refine(
        (value) => value.match(/\d/) || !value.match(/[a-zA-Z]/),
        'Password must contain at least 1 letter and 1 number'
      ),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// const logout = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const refreshTokens = {
//   body: Joi.object().keys({
//     refreshToken: Joi.string().required(),
//   }),
// };

// const forgotPassword = {
//   body: Joi.object().keys({
//     email: Joi.string().email().required(),
//   }),
// };

// const resetPassword = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
//   body: Joi.object().keys({
//     password: Joi.string().required().custom(password),
//   }),
// };

// const verifyEmail = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
// };

export default {
  register,
  login,
  // logout,
  // refreshTokens,
  // forgotPassword,
  // resetPassword,
  // verifyEmail,
};
