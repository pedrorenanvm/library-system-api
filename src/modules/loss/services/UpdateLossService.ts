import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';
import AppError from '@shared/errors/AppError';

import { LossStatus } from '../infra/typeorm/entities/Loss';

import { ILoss } from '../domain/models/ILoss';
import { ILossRepository } from '../domain/repositories/ILossRepository';

interface IRequest {
  id: string;
  notes?: string;
  replacementFee?: number;
  status?: LossStatus;
}

@injectable()
class UpdateLossService {
  constructor(
    @inject(REPOSITORY_KEYS.LossRepository)
    private lossRepository: ILossRepository
  ) {}

  public async execute({
    id,
    notes,
    replacementFee,
    status,
  }: IRequest): Promise<ILoss> {
    const loss = await this.lossRepository.findById(id);

    if (!loss) {
      throw new AppError('Perda não encontrada.', 404);
    }

    if (notes !== undefined) {
      loss.notes = notes;
    }

    if (replacementFee !== undefined) {
      loss.replacementFee = replacementFee;
    }

    if (status !== undefined) {
      loss.status = status;
    }

    return this.lossRepository.update(loss);
  }
}

export default UpdateLossService;
