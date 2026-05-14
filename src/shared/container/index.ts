import { container } from 'tsyringe';
import 'reflect-metadata';

import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { UserRepository } from '@modules/user/infra/typeorm/repositories/UserRepository';

import { TitleRepository } from '@modules/title/infra/typeorm/repositories/TitleRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';

import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { LoanRepository } from '@modules/loan/infra/typeorm/repositories/LoanRepository';

import { REPOSITORY_KEYS } from './keys';

container.registerSingleton<IUserRepository>(
  REPOSITORY_KEYS.UserRepository,
  UserRepository
);

container.registerSingleton<ITitleRepository>(
  REPOSITORY_KEYS.TitleRepository,
  TitleRepository
)

container.registerSingleton<ILoanRepository>(
  REPOSITORY_KEYS.LoanRepository,
  LoanRepository
)
