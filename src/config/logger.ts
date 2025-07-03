import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';
import config from './config';

// Format error stack trace
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// Initialize Logtail client
const logtail = config.logtailSourceToken ? new Logtail(config.logtailSourceToken) : null;

// Init logger
const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    // Add Logtail transport in production
    ...(config.env === 'production' && logtail ? [new LogtailTransport(logtail)] : []),
  ],
});

export default logger;
