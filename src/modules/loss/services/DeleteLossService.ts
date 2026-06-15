import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';
import AppError from '@shared/errors/AppError';

import { ILossRepository } from '../domain/repositories/ILossRepository';

interface IRequest {
  id: string;
}

@injectable()
class DeleteLossService {
  constructor(
    @inject(REPOSITORY_KEYS.LossRepository)
    private lossRepository: ILossRepository
  ) {}

  public async execute({ id }: IRequest): Promise<void> {
    const loss = await this.lossRepository.findById(id);

    if (!loss) {
      throw new AppError('Perda não encontrada.', 404);
    }

    await this.lossRepository.delete(id);
  }
}

export default DeleteLossService;
