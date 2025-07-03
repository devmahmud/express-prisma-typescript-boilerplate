import httpStatus from 'http-status';
import catchAsync from '@/shared/utils/catch-async';
import pick from '@/shared/utils/pick';
import ApiError from '@/shared/utils/api-error';
import { PostService } from './post.service';
import { ExtendedUser } from '@/types/response';

const createPost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const post = await PostService.createPost(req.body, (req.user as ExtendedUser).id);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'published']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await PostService.queryPosts(filter, options);
  res.send(result);
});

const getPost = catchAsync(async (req, res) => {
  const post = await PostService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  const post = await PostService.updatePostById(
    req.params.postId,
    req.body,
    (req.user as ExtendedUser).id
  );
  res.send(post);
});

const deletePost = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
  await PostService.deletePostById(req.params.postId, (req.user as ExtendedUser).id);
  res.status(httpStatus.NO_CONTENT).send();
});

export const PostController = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
