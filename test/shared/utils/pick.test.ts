import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import pick from '@/shared/utils/pick';

describe('Pick Utils', () => {
  it('should pick specified keys from object', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: ['USER'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const keys = ['id', 'name', 'email'];
    const result = pick(obj, keys);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', obj.name);
    expect(result).toHaveProperty('email', obj.email);
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('role');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
  });

  it('should handle empty keys array', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };

    const result = pick(obj, []);

    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should handle non-existent keys gracefully', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
    };

    const keys = ['id', 'nonExistentKey', 'name'];
    const result = pick(obj, keys);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', obj.name);
    expect(result).not.toHaveProperty('nonExistentKey');
  });

  it('should handle nested objects', () => {
    const obj = {
      user: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
      },
      settings: {
        theme: 'dark',
        language: 'en',
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const keys = ['user', 'settings'];
    const result = pick(obj, keys);

    expect(result).toHaveProperty('user', obj.user);
    expect(result).toHaveProperty('settings', obj.settings);
    expect(result).not.toHaveProperty('metadata');
  });

  it('should handle arrays', () => {
    const obj = {
      id: faker.string.uuid(),
      tags: ['javascript', 'typescript', 'nodejs'],
      scores: [85, 92, 78],
      metadata: {
        createdAt: new Date(),
      },
    };

    const keys = ['id', 'tags', 'scores'];
    const result = pick(obj, keys);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('tags', obj.tags);
    expect(result).toHaveProperty('scores', obj.scores);
    expect(result).not.toHaveProperty('metadata');
  });

  it('should handle null and undefined values', () => {
    const obj = {
      id: faker.string.uuid(),
      name: null,
      email: undefined,
      active: true,
    };

    const keys = ['id', 'name', 'email', 'active'];
    const result = pick(obj, keys);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', null);
    expect(result).toHaveProperty('email', undefined);
    expect(result).toHaveProperty('active', true);
  });

  it('should preserve object reference types', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };

    const keys = ['id', 'name'];
    const result = pick(obj, keys);

    // TypeScript should infer the correct type
    expect(typeof result.id).toBe('string');
    expect(typeof result.name).toBe('string');
  });
});
