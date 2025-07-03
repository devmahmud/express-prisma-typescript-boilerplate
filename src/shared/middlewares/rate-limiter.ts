import rateLimit from 'express-rate-limit';

// 150 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  skipSuccessfulRequests: true,
});
