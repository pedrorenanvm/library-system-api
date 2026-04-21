import jwt from '@config/auth';
import { NextFunction, Request, Response } from 'express';
import { Secret, verify } from 'jsonwebtoken';
import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  iat: number;
  exp: number;
  sub: string;
  tenant_id: string;
}
export default function isAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies.token;

  if (!token) {
    throw new AppError('Email ou Senha incorretos', 403);
  }

  try {
    const decodedToken = verify(token, jwt.jwt.secret as Secret);
    const { sub } = decodedToken as ITokenPayload;

    req.user = {
      id: sub,
    };

    return next();
  } catch {
    throw new AppError('Usuário expirado, se conecte novamente', 401);
  }
}
