import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';
import AppError from '@shared/errors/AppError';

import { ILossRepository } from '../domain/repositories/ILossRepository';

interface IRequest {
  id: string;
}

@injectable()
class ShowLossService {
  constructor(
    @inject(REPOSITORY_KEYS.LossRepository)
    private lossRepository: ILossRepository
  ) {}

  public async execute({ id }: IRequest) {
    const loss = await this.lossRepository.findById(id);

    if (!loss) {
      throw new AppError('Perda não encontrada.', 404);
    }

    return loss;
  }
}

export default ShowLossService;
