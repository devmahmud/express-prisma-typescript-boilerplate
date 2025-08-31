import { Prisma, Post } from '@prisma/client';
import prisma from '@/client';
import {
  createBaseRepository,
  PaginationOptions,
  PaginatedResult,
} from '@/shared/repositories/base.repository';

export interface PostCreateInput {
  title: string;
  content: string;
  published?: boolean;
  authorId: string;
}

export type PostUpdateInput = Partial<Prisma.PostUpdateInput>;

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    comments: number;
  };
}

export interface PostWithAuthorAndComments extends Post {
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export interface PostRepository {
  create(data: PostCreateInput): Promise<PostWithAuthor>;
  findById(id: string): Promise<PostWithAuthorAndComments | null>;
  findMany(
    where?: Record<string, any>,
    options?: PaginationOptions
  ): Promise<PaginatedResult<PostWithAuthor>>;
  update(id: string, data: PostUpdateInput): Promise<PostWithAuthor | null>;
  delete(id: string): Promise<Post | null>;
  count(where?: Record<string, any>): Promise<number>;
}

// Create base repository functions
const basePostRepo = createBaseRepository<Post, PostCreateInput, PostUpdateInput>(prisma, 'post');

// Post-specific repository functions
export const createPost = async (data: PostCreateInput): Promise<PostWithAuthor> => {
  return prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      published: data.published,
      author: {
        connect: { id: data.authorId },
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

export const findPostById = async (id: string): Promise<PostWithAuthorAndComments | null> => {
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

export const findPosts = async (
  where?: Record<string, any>,
  options?: PaginationOptions
): Promise<PaginatedResult<PostWithAuthor>> => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const sortBy = options?.sortBy;
  const sortType = options?.sortType ?? 'desc';

  // Handle published filter
  const { published, ...restFilter } = where || {};
  const finalWhere = {
    ...restFilter,
    ...(published !== undefined && { published: published === 'true' }),
  };

  const totalCount = await prisma.post.count({ where: finalWhere });
  const totalPages = Math.ceil(totalCount / limit);

  const results = await prisma.post.findMany({
    where: finalWhere,
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
    orderBy: sortBy ? { [sortBy]: sortType } : { createdAt: 'desc' },
  });

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults: totalCount,
  };
};

export const updatePost = async (
  id: string,
  data: PostUpdateInput
): Promise<PostWithAuthor | null> => {
  return prisma.post.update({
    where: { id },
    data,
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

export const deletePost = async (id: string): Promise<Post | null> => {
  return basePostRepo.delete(id);
};

export const countPosts = async (where?: Record<string, any>): Promise<number> => {
  return basePostRepo.count(where);
};

// Export the complete post repository object
export const postRepository: PostRepository = {
  create: createPost,
  findById: findPostById,
  findMany: findPosts,
  update: updatePost,
  delete: deletePost,
  count: countPosts,
};
