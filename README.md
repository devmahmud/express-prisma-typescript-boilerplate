# Express Prisma TypeScript Boilerplate

A production-ready REST API boilerplate with Node.js, Express, TypeScript, and Prisma.

## Features

- **TypeScript** - Type-safe development
- **Express.js** - Fast, unopinionated web framework
- **Prisma** - Modern database toolkit
- **PostgreSQL** - Robust, open-source database
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Flexible permission system
- **Input Validation** - Request validation with Joi
- **Error Handling** - Centralized error handling
- **Logging** - Structured logging with Winston
- **Rate Limiting** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Swagger/OpenAPI** - API documentation
- **Docker** - Containerization support
- **PM2** - Process management
- **Testing** - Unit and integration tests with Vitest
- **ESLint & Prettier** - Code quality and formatting
- **Husky** - Git hooks
- **Semantic Release** - Automated versioning

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-prisma-typescript-boilerplate
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET=your-jwt-secret
```

5. Set up the database:
```bash
yarn db:migrate
```

6. Start the development server:
```bash
yarn dev
```

The API will be available at `http://localhost:8000`

## Project Structure

```
src/
├── config/                 # Configuration files
│   ├── config.ts          # Main configuration
│   ├── logger.ts          # Logging configuration
│   ├── morgan.ts          # HTTP request logging
│   ├── passport.ts        # Authentication strategy
│   ├── roles.ts           # Role-based access control
│   └── limiter.ts         # Rate limiting
├── modules/               # Feature modules
│   ├── auth/              # Authentication module
│   ├── user/              # User management
│   ├── post/              # Example post module
│   ├── notification/      # Notifications
│   └── file/              # File uploads
├── shared/                # Shared utilities
│   ├── middlewares/       # Express middlewares
│   ├── services/          # Shared services
│   └── utils/             # Utility functions
├── routes/                # Route definitions
├── types/                 # TypeScript type definitions
└── index.ts               # Application entry point
```

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/v1/docs`
- OpenAPI JSON: `http://localhost:8000/v1/docs-json`

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn coverage` - Generate test coverage
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn prettier` - Check code formatting
- `yarn prettier:fix` - Fix code formatting
- `yarn db:studio` - Open Prisma Studio
- `yarn db:migrate` - Run database migrations
- `yarn docker:dev` - Start with Docker (development)
- `yarn docker:prod` - Start with Docker (production)

## Docker

The boilerplate includes Docker configuration for easy development and deployment.

### Development
```bash
yarn docker:dev
```

### Production
```bash
yarn docker:prod
```

### With Database and Redis
The main `docker-compose.yml` includes PostgreSQL and Redis services:

```bash
docker compose up --build
```

This will start:
- Express API server
- PostgreSQL database
- Redis cache

## Environment Variables

| Variable                        | Description                   | Default       |
| ------------------------------- | ----------------------------- | ------------- |
| `NODE_ENV`                      | Environment                   | `development` |
| `PORT`                          | Server port                   | `8000`        |
| `DATABASE_URL`                  | Database connection string    | -             |
| `JWT_SECRET`                    | JWT secret key                | `secret`      |
| `JWT_ACCESS_EXPIRATION_MINUTES` | JWT access token expiration   | `30`          |
| `JWT_REFRESH_EXPIRATION_DAYS`   | JWT refresh token expiration  | `30`          |
| `SMTP_HOST`                     | SMTP server host              | -             |
| `SMTP_PORT`                     | SMTP server port              | -             |
| `SMTP_USERNAME`                 | SMTP username                 | -             |
| `SMTP_PASSWORD`                 | SMTP password                 | -             |
| `EMAIL_FROM`                    | Email sender address          | -             |
| `REDIS_URL`                     | Redis connection string       | -             |
| `SENTRY_DSN`                    | Sentry DSN for error tracking | -             |
| `LOGTAIL_SOURCE_TOKEN`          | Logtail source token          | -             |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
