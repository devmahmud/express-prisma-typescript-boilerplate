import { PrismaClient, Prisma } from '@prisma/client';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';

const prisma = new PrismaClient();

const createPost = async (postBody: Prisma.PostCreateInput, userId: string) => {
  return prisma.post.create({
    data: {
      ...postBody,
      author: {
        connect: { id: userId },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const queryPosts = async (filter: any, options: any) => {
  const { limit, page, sortBy, sortType } = options;
  const { published, ...restFilter } = filter;

  const where = {
    ...restFilter,
    ...(published !== undefined && { published: published === 'true' }),
  };

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType || 'desc' } : { createdAt: 'desc' },
  });

  const total = await prisma.post.count({ where });

  return {
    results: posts,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
  };
};

const getPostById = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
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
  Object.assign(post, updateBody);
  return prisma.post.update({
    where: { id: postId },
    data: updateBody,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const deletePostById = async (postId: string, userId: string) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.authorId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await prisma.post.delete({ where: { id: postId } });
};

export const PostService = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
};
