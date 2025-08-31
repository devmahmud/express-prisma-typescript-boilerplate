import { PrismaClient } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface BaseRepository<T, CreateInput, UpdateInput> {
  create(data: CreateInput): Promise<T>;
  findById(id: string, select?: Record<string, boolean>): Promise<T | null>;
  findMany(
    where?: Record<string, any>,
    options?: PaginationOptions,
    select?: Record<string, boolean>
  ): Promise<PaginatedResult<T>>;
  update(id: string, data: UpdateInput, select?: Record<string, boolean>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  count(where?: Record<string, any>): Promise<number>;
}

// Functional utility functions for common database operations
export const createBaseRepository = <T, CreateInput, UpdateInput>(
  prisma: PrismaClient,
  modelName: string
): BaseRepository<T, CreateInput, UpdateInput> => {
  return {
    async create(data: CreateInput): Promise<T> {
      return (prisma as any)[modelName].create({ data });
    },

    async findById(id: string, select?: Record<string, boolean>): Promise<T | null> {
      return (prisma as any)[modelName].findUnique({
        where: { id },
        select,
      });
    },

    async findMany(
      where?: Record<string, any>,
      options?: PaginationOptions,
      select?: Record<string, boolean>
    ): Promise<PaginatedResult<T>> {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const sortBy = options?.sortBy;
      const sortType = options?.sortType ?? 'desc';

      const totalCount = await (prisma as any)[modelName].count({ where });
      const totalPages = Math.ceil(totalCount / limit);

      const results = await (prisma as any)[modelName].findMany({
        where,
        select,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortType } : undefined,
      });

      return {
        results,
        page,
        limit,
        totalPages,
        totalResults: totalCount,
      };
    },

    async update(
      id: string,
      data: UpdateInput,
      select?: Record<string, boolean>
    ): Promise<T | null> {
      return (prisma as any)[modelName].update({
        where: { id },
        data,
        select,
      });
    },

    async delete(id: string): Promise<T | null> {
      return (prisma as any)[modelName].delete({
        where: { id },
      });
    },

    async count(where?: Record<string, any>): Promise<number> {
      return (prisma as any)[modelName].count({ where });
    },
  };
};
