// Custom error class with status code and isOperational property
class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors: { path: string; message: string }[] | undefined;

  constructor(
    statusCode: number,
    message: string | undefined,
    isOperational = true,
    stack = '',
    errors?: { path: string; message: string }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
