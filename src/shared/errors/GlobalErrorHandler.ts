import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import AppError from './AppError';
import multer from 'multer';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (isCelebrateError(err)) {
    const validationErrors: string[] = [];

    err.details.forEach((detail) => {
      detail.details.forEach((error) => {
        const cleanMessage = error.message.replace(/["\\]/g, '');
        validationErrors.push(cleanMessage);
      });
    });

    return res.status(402).json({
      status: 'error',
      message: 'Erro de validação nos dados enviados.',
      details: validationErrors,
    });
  }
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'O arquivo excede o limite de 10MB.',
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}
