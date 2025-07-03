import httpStatus from 'http-status';
import catchAsync from '@/shared/utils/catch-async';
import pick from '@/shared/utils/pick';
import ApiError from '@/shared/utils/api-error';
import zParse from '@/shared/utils/z-parse';
import { PostService } from './post.service';
import { ExtendedUser } from '@/types/response';
import * as postSchema from './post.validation';

const createPost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const { body } = await zParse(postSchema.createPostSchema, req);
  const post = await PostService.createPost(body, (req.user as ExtendedUser).id);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const { query } = await zParse(postSchema.getPostsSchema, req);
  const filter = pick(query, ['title', 'published']);
  const options = pick(query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await PostService.queryPosts(filter, options);
  res.send(result);
});

const getPost = catchAsync(async (req, res) => {
  const { params } = await zParse(postSchema.getPostSchema, req);
  const post = await PostService.getPostById(params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const { params, body } = await zParse(postSchema.updatePostSchema, req);
  const post = await PostService.updatePostById(params.postId, body, (req.user as ExtendedUser).id);
  res.send(post);
});

const deletePost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const { params } = await zParse(postSchema.deletePostSchema, req);
  await PostService.deletePostById(params.postId, (req.user as ExtendedUser).id);
  res.status(httpStatus.NO_CONTENT).send();
});

export const PostController = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
