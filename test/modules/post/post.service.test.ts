import { describe, expect, it, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';

import { PostService } from '@/modules/post/post.service';
import { createTestUser, createTestPost, createTestComment } from '../../utils/test-setup';
import ApiError from '@/shared/utils/api-error';

describe('Post Service', () => {
  describe('createPost', () => {
    it('should create a new post successfully', async () => {
      const user = await createTestUser();
      const postData = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        published: true,
      };

      const result = await PostService.createPost(postData, user.id);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(postData.title);
      expect(result.content).toBe(postData.content);
      expect(result.published).toBe(postData.published);
      expect(result.authorId).toBe(user.id);
      expect(result.author).toHaveProperty('id', user.id);
      expect(result.author).toHaveProperty('name', user.name);
      expect(result.author).toHaveProperty('email', user.email);
    });

    it('should create unpublished post by default', async () => {
      const user = await createTestUser();
      const postData = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
      };

      const result = await PostService.createPost(postData, user.id);

      expect(result.published).toBe(false);
    });
  });

  describe('queryPosts', () => {
    let user1: any, user2: any;

    beforeEach(async () => {
      user1 = await createTestUser();
      user2 = await createTestUser();

      // Create multiple posts
      await createTestPost(user1.id, { published: true });
      await createTestPost(user1.id, { published: false });
      await createTestPost(user2.id, { published: true });
    });

    it('should return paginated posts with default options', async () => {
      const result = await PostService.queryPosts({}, { limit: 10, page: 1 });

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('totalResults');
      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should filter posts by published status', async () => {
      const result = await PostService.queryPosts({ published: 'true' }, { limit: 10, page: 1 });

      expect(result.results.every((post) => post.published)).toBe(true);
    });

    it('should filter posts by author', async () => {
      const result = await PostService.queryPosts({ authorId: user1.id }, { limit: 10, page: 1 });

      expect(result.results.every((post) => post.authorId === user1.id)).toBe(true);
    });

    it('should sort posts by createdAt desc by default', async () => {
      const result = await PostService.queryPosts({}, { limit: 10, page: 1 });

      expect(result.results.length).toBeGreaterThan(1);
      const dates = result.results.map((post) => new Date(post.createdAt));
      expect(dates[0] >= dates[1]).toBe(true);
    });

    it('should sort posts by title asc', async () => {
      const result = await PostService.queryPosts(
        {},
        { limit: 10, page: 1, sortBy: 'title', sortType: 'asc' }
      );

      expect(result.results.length).toBeGreaterThan(1);
      const titles = result.results.map((post) => post.title);
      expect(titles[0] <= titles[1]).toBe(true);
    });

    it('should include comment count', async () => {
      const post = await createTestPost(user1.id);
      await createTestComment(user1.id, post.id);
      await createTestComment(user2.id, post.id);

      const result = await PostService.queryPosts({}, { limit: 10, page: 1 });
      const postWithComments = result.results.find((p) => p.id === post.id);

      expect(postWithComments?._count?.comments).toBe(2);
    });
  });

  describe('getPostById', () => {
    it('should return post with author and comments', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      const comment = await createTestComment(user.id, post.id);

      const result = await PostService.getPostById(post.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(post.id);
      expect(result?.title).toBe(post.title);
      expect(result?.author).toHaveProperty('id', user.id);
      expect(result?.author).toHaveProperty('name', user.name);
      expect(result?.author).toHaveProperty('email', user.email);
      expect(result?.comments).toHaveLength(1);
      expect(result?.comments[0].id).toBe(comment.id);
      expect(result?.comments[0].author).toHaveProperty('id', user.id);
    });

    it('should return null for non-existent post', async () => {
      const result = await PostService.getPostById(faker.string.uuid());

      expect(result).toBeNull();
    });

    it('should order comments by createdAt desc', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      // Create comments
      await createTestComment(user.id, post.id);
      await createTestComment(user.id, post.id);

      const result = await PostService.getPostById(post.id);

      expect(result?.comments).toHaveLength(2);
      // Comments should be ordered by createdAt desc (most recent first)
      const commentDates = result?.comments?.map((c) => new Date(c.createdAt));
      expect(commentDates && commentDates[0] >= commentDates[1]).toBe(true);
    });
  });

  describe('updatePostById', () => {
    it('should update post successfully', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      const updateData = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        published: true,
      };

      const result = await PostService.updatePostById(post.id, updateData, user.id);

      expect(result?.title).toBe(updateData.title);
      expect(result?.content).toBe(updateData.content);
      expect(result?.published).toBe(updateData.published);
      expect(result?.author).toHaveProperty('id', user.id);
    });

    it('should throw error for non-existent post', async () => {
      const user = await createTestUser();
      const updateData = { title: faker.lorem.sentence() };

      await expect(
        PostService.updatePostById(faker.string.uuid(), updateData, user.id)
      ).rejects.toThrow(new ApiError(404, 'Post not found'));
    });

    it('should throw error when user is not the author', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const post = await createTestPost(user1.id);
      const updateData = { title: faker.lorem.sentence() };

      await expect(PostService.updatePostById(post.id, updateData, user2.id)).rejects.toThrow(
        new ApiError(403, 'Forbidden')
      );
    });
  });

  describe('deletePostById', () => {
    it('should delete post successfully', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);

      await PostService.deletePostById(post.id, user.id);

      // Verify post is deleted
      const deletedPost = await PostService.getPostById(post.id);
      expect(deletedPost).toBeNull();
    });

    it('should throw error for non-existent post', async () => {
      const user = await createTestUser();

      await expect(PostService.deletePostById(faker.string.uuid(), user.id)).rejects.toThrow(
        new ApiError(404, 'Post not found')
      );
    });

    it('should throw error when user is not the author', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const post = await createTestPost(user1.id);

      await expect(PostService.deletePostById(post.id, user2.id)).rejects.toThrow(
        new ApiError(403, 'Forbidden')
      );
    });

    it('should delete post with comments', async () => {
      const user = await createTestUser();
      const post = await createTestPost(user.id);
      await createTestComment(user.id, post.id);

      await PostService.deletePostById(post.id, user.id);

      // Verify post and comments are deleted
      const deletedPost = await PostService.getPostById(post.id);
      expect(deletedPost).toBeNull();
    });
  });
});
