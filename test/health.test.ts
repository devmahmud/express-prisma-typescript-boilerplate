import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '@/app';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});
