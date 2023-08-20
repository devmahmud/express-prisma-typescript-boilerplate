import request from 'supertest';
import httpStatus from 'http-status';
import { z } from 'zod';
import app from '@/app';
import config from '@/config/config';
import { describe, test } from '@jest/globals';

describe('Auth routes', () => {
  describe('GET /v1/docs', () => {
    test('should return 404 when running in production', async () => {
      config.env = 'production';
      await request(app).get('/v1/docs').send().expect(httpStatus.NOT_FOUND);
      config.env = z.enum(['production', 'development', 'test']).parse(process.env.NODE_ENV);
    });
  });
});
