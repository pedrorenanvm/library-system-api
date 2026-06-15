import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ILossRepository } from '../domain/repositories/ILossRepository';

@injectable()
class ListLossesService {
  constructor(
    @inject(REPOSITORY_KEYS.LossRepository)
    private lossRepository: ILossRepository
  ) {}

  public async execute() {
    return this.lossRepository.findAll();
  }
}

export default ListLossesService;
