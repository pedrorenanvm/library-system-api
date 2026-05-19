import { container } from 'tsyringe';
import 'reflect-metadata';

import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { UserRepository } from '@modules/user/infra/typeorm/repositories/UserRepository';

import { TitleRepository } from '@modules/title/infra/typeorm/repositories/TitleRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';

import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { LoanRepository } from '@modules/loan/infra/typeorm/repositories/LoanRepository';

import { REPOSITORY_KEYS } from './keys';
import { FineRepository } from '@modules/fine/infra/typeorm/repositories/FineRepository';
import { IFineRepository } from '@modules/fine/domain/repositories/IFineRepository';

import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { CopyRepository } from '@modules/copy/infra/typeorm/repositories/CopyRepository';

container.registerSingleton<IUserRepository>(
  REPOSITORY_KEYS.UserRepository,
  UserRepository
);

container.registerSingleton<ITitleRepository>(
  REPOSITORY_KEYS.TitleRepository,
  TitleRepository
);

container.registerSingleton<ICopyRepository>(
  REPOSITORY_KEYS.CopyRepository,
  CopyRepository

);

container.registerSingleton<ILoanRepository>(
  REPOSITORY_KEYS.LoanRepository,
  LoanRepository
);

container.registerSingleton<IFineRepository>(
  REPOSITORY_KEYS.FineRepository,
  FineRepository
);
