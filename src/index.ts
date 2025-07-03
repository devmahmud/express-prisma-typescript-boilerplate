import { Server } from 'http';
import app from '@/app';
import prisma from '@/client';
import config from '@/config/config';
import logger from '@/config/logger';

let server: Server;

// Connect to Prisma
prisma
  .$connect()
  .then(() => {
    logger.info('🔌 Connected to SQL Database');
    if (config.redisUrl) {
      logger.info('⌛️ Connected to Redis');
    }
    server = app.listen(config.port, () => {
      logger.info(`🚀 Running in ${config.env} mode on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error(error);
    process.exit(1);
  });

const exitHandler = async () => {
  if (server) {
    server.close(async () => {
      logger.info('Server closed');
      await prisma.$disconnect(); // gracefully close DB connection
      process.exit(1);
    });
  } else {
    await prisma.$disconnect(); // gracefully close DB connection
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed and connections disconnected');
    });
  }
});
