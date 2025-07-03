import { Request, Response } from 'express';
import httpStatus from 'http-status';

import ApiError from './api-error';
import { formatResponse } from './response-formatter';

type ControllerFunction = (req: Request, res: Response) => Promise<any>;

const catchAsync = (handler: ControllerFunction) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await handler(req, res);

      // If result is undefined, assume the response has been handled in the controller
      if (result === undefined) return;

      // If result includes a custom status code and message
      const status = result.statusCode || httpStatus.OK;
      const message = result.message || 'Operation successful';

      const response = formatResponse(status, message, result.data);
      res.status(status).send(response);
    } catch (error) {
      const status = (error as ApiError).statusCode || httpStatus.INTERNAL_SERVER_ERROR;
      const message = (error as ApiError).message || 'Internal server error';
      const errors = (error as ApiError).errors || [];
      res.status(status).send(formatResponse(status, message, undefined, errors));
    }
  };
};

export default catchAsync;
