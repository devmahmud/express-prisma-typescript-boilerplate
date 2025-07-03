import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Define env vars schema
const envVarsSchema = z.object({
  NODE_ENV: z
    .enum(['production', 'development', 'staging', 'test'])
    .refine((value) => value !== undefined, { message: 'NODE_ENV is required' })
    .default('development'),
  APP_INSTANCES: z.coerce.number().default(1),
  PORT: z.coerce.number().default(8000),
  SENTRY_DSN: z.string().optional().describe('sentry dsn'),
  REDIS_URL: z.string().optional().describe('redis url'),
  DATABASE_URL: z.string().describe('database connection string'),
  JWT_SECRET: z.string().default('secret').describe('JWT secret key'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(30)
    .describe('minutes after which access tokens expire'),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce
    .number()
    .default(30)
    .describe('days after which refresh tokens expire'),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(10)
    .describe('minutes after which reset password token expires'),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce
    .number()
    .default(10)
    .describe('minutes after which verify email token expires'),
  SMTP_HOST: z.string().optional().describe('server that will send the emails'),
  SMTP_PORT: z.coerce.number().optional().describe('port to connect to the email server'),
  SMTP_USERNAME: z.string().optional().describe('username for email server'),
  SMTP_PASSWORD: z.string().optional().describe('password for email server'),
  EMAIL_FROM: z.string().optional().describe('the from field in the emails sent by the app'),
  SWAGGER_USERNAME: z.string().default('admin').describe('swagger username'),
  SWAGGER_PASSWORD: z.string().default('admin').describe('swagger password'),
  LOGTAIL_SOURCE_TOKEN: z.string().optional().describe('logtail source token for production'),
});

// Validate env vars
const envVars = envVarsSchema.safeParse(process.env);

if (!envVars.success) {
  throw new Error(`Config validation error: ${envVars.error.message}`);
}

export default {
  env: envVars.data.NODE_ENV,
  appInstances: envVars.data.APP_INSTANCES,
  sentryDsn: envVars.data.SENTRY_DSN,
  port: envVars.data.PORT,
  redisUrl: envVars.data.REDIS_URL,
  databaseUrl: envVars.data.DATABASE_URL,
  jwt: {
    secret: envVars.data.JWT_SECRET,
    accessExpirationMinutes: envVars.data.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.data.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.data.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.data.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.data.SMTP_HOST,
      port: envVars.data.SMTP_PORT,
      auth: {
        user: envVars.data.SMTP_USERNAME,
        pass: envVars.data.SMTP_PASSWORD,
      },
    },
    from: envVars.data.EMAIL_FROM,
  },
  swagger: {
    username: envVars.data.SWAGGER_USERNAME,
    password: envVars.data.SWAGGER_PASSWORD,
  },
  logtailSourceToken: envVars.data.LOGTAIL_SOURCE_TOKEN,
};
