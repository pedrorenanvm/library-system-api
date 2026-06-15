import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';
import AppError from '@shared/errors/AppError';

import { ILoss } from '../domain/models/ILoss';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { ILossRepository } from '../domain/repositories/ILossRepository';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { LossStatus } from '../infra/typeorm/entities/Loss';

interface IRequest {
  copyId: string;
  userId: string;
  notes?: string;
  replacementFee?: number;
}

@injectable()
class CreateLossService {
  constructor(
    @inject(REPOSITORY_KEYS.LossRepository)
    private lossRepository: ILossRepository,

    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository,

    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute({
    copyId,
    userId,
    notes,
    replacementFee,
  }: IRequest): Promise<ILoss> {
    const copy = await this.copyRepository.findById(copyId);

    if (!copy) {
      throw new AppError('Exemplar não encontrado.', 404);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const existingLoss = await this.lossRepository.findByCopyId(copyId);

    if (existingLoss) {
      throw new AppError('Este exemplar já possui um registro de perda.', 409);
    }

    const loss = await this.lossRepository.create({
      copyId,
      userId,
      notes: notes ?? null,
      replacementFee: replacementFee ?? null,
      reportedAt: new Date(),
      status: LossStatus.PENDING,
    });

    await this.copyRepository.updateStatus(copyId, CopyStatus.LOST);

    return loss;
  }
}

export default CreateLossService;
