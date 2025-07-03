import { PrismaClient } from '@prisma/client';
import config from '@/config/config';

// Add prisma to the NodeJS global type
interface CustomNodeJsGlobal {
  prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal;

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['info', 'warn', 'error'],
  });

if (config.env === 'development') global.prisma = prisma;

export default prisma;
