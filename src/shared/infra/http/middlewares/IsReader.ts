import { Request, Response, NextFunction } from 'express';
import AppError from '@shared/errors/AppError';
import { UserRepository } from '@modules/user/infra/typeorm/repositories/UserRepository';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';

export default async function isReader(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user || !req.user.id) {
    throw new AppError('Usuário não autenticado', 401);
  }

  const userRepository = new UserRepository();
  const user = await userRepository.verifyRole(req.user.id);

  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }
  if (user.role === UserRole.ADMIN) {
    return next();
  }
  if (user.role !== UserRole.READER) {
    throw new AppError('Acesso negado. Você não tem permissão.', 403);
  }

  return next();
}
