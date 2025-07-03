import compression from 'compression';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import httpStatus from 'http-status';
import passport from 'passport';

import config from '@/config/config';
import morgan from '@/config/morgan';
import { jwtStrategy } from '@/config/passport';
import routes from '@/routes';
import { errorConverter, errorHandler } from '@/shared/middlewares/error';
import { authLimiter } from '@/shared/middlewares/rate-limiter';
import xss from '@/shared/middlewares/xss';
import ApiError from '@/shared/utils/api-error';
import { openApiDocument } from './openapi';
import swaggerUi from 'swagger-ui-express';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
const corsOptions: cors.CorsOptions = {
  origin: (
    requestOrigin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:8000'];

    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware before other routes
app.use(cors(corsOptions));

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  // Limit repeated failed requests to auth endpoints
  app.use('/v1/auth', authLimiter);

  // Swagger docs with basic auth in production
  app.use(
    '/v1/docs',
    basicAuth({
      users: { [config.swagger.username]: config.swagger.password },
      challenge: true,
      unauthorizedResponse: () => 'Unauthorized',
    })
  );
}

// v1 api routes
app.use('/v1', routes);

// Swagger docs (after routes to avoid conflicts)
app.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
