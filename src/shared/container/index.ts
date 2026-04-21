import { container } from 'tsyringe';
import 'reflect-metadata';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { REPOSITORY_KEYS } from './keys';
import { UserRepository } from '@modules/user/infra/typeorm/repositories/UserRepository';

container.registerSingleton<IUserRepository>(
  REPOSITORY_KEYS.UserRepository,
  UserRepository
);
