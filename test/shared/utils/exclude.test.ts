import { describe, expect, it } from 'vitest';
import { faker } from '@faker-js/faker';

import exclude from '@/shared/utils/exclude';

describe('Exclude Utils', () => {
  it('should exclude specified keys from object', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const result = exclude(obj, ['password']);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', obj.name);
    expect(result).toHaveProperty('email', obj.email);
    expect(result).not.toHaveProperty('password');
  });

  it('should handle empty keys array', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };

    const result = exclude(obj, []);

    expect(result).toEqual(obj);
    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', obj.name);
    expect(result).toHaveProperty('email', obj.email);
  });

  it('should handle non-existent keys gracefully', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
    };

    const result = exclude(obj, ['nonExistentKey' as keyof typeof obj]);

    expect(result).toEqual(obj);
    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', obj.name);
  });

  it('should handle null and undefined values', () => {
    const obj = {
      id: faker.string.uuid(),
      name: null,
      email: undefined,
      active: true,
      password: faker.internet.password(),
    };

    const result = exclude(obj, ['password']);

    expect(result).toHaveProperty('id', obj.id);
    expect(result).toHaveProperty('name', null);
    expect(result).toHaveProperty('email', undefined);
    expect(result).toHaveProperty('active', true);
    expect(result).not.toHaveProperty('password');
  });

  it('should exclude all specified keys when they exist', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const result = exclude(obj, ['id', 'name', 'email', 'password']);

    expect(result).toEqual({});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should preserve object reference types', () => {
    const obj = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const result = exclude(obj, ['password']);

    // TypeScript should infer the correct type
    expect(typeof result.id).toBe('string');
    expect(typeof result.name).toBe('string');
    expect(typeof result.email).toBe('string');
    expect(result).not.toHaveProperty('password');
  });
});
