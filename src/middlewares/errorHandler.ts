import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../utils/errors/BaseError';
import logger from '../utils/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  const status = err instanceof BaseError && err.statusCode ? err.statusCode : 500;

  logger.error(`${req.method} ${req.originalUrl} ${status} - ${err.message}`, {
    stack: err.stack
  });

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
