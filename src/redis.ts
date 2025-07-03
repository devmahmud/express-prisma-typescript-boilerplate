import Redis from 'ioredis';
import config from '@/config/config';
import logger from '@/config/logger';

let redis: Redis | null = null;

if (config.redisUrl) {
  redis = new Redis(config.redisUrl);

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  redis.on('close', () => {
    logger.info('Redis connection closed');
  });
}

export default redis;
