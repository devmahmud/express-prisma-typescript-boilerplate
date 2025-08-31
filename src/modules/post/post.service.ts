import { Prisma } from '@prisma/client';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';
import { postRepository } from './post.repository';

type CreatePostData = {
  title: string;
  content: string;
  published?: boolean;
};

const createPost = async (postBody: CreatePostData, userId: string) => {
  return postRepository.create({
    ...postBody,
    authorId: userId,
  });
};

const queryPosts = async (filter: any, options: any) => {
  return postRepository.findMany(filter, options);
};

const getPostById = async (id: string) => {
  return postRepository.findById(id);
};

const updatePostById = async (
  postId: string,
  updateBody: Prisma.PostUpdateInput,
  userId: string
) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  return postRepository.update(postId, updateBody);
};

const deletePostById = async (postId: string, userId: string) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await postRepository.delete(postId);
};

export const PostService = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
