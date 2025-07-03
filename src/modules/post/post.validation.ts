import Joi from 'joi';
import { objectId } from '@/shared/utils/validate';

export const createPost = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    published: Joi.boolean(),
  }),
};

export const getPosts = {
  query: Joi.object().keys({
    title: Joi.string(),
    published: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

export const updatePost = {
  params: Joi.object().keys({
    postId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      content: Joi.string(),
      published: Joi.boolean(),
    })
    .min(1),
};

export const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

export const postValidation = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
