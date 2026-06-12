import { inject, injectable } from 'tsyringe';

import { REPOSITORY_KEYS } from '@shared/container/keys';

import { IFine } from '../domain/models/IFine';
import { IFineRepository } from '../domain/repositories/IFineRepository';

@injectable()
class ViewFineByUser {
  constructor(
    @inject(REPOSITORY_KEYS.FineRepository)
    private readonly fineRepository: IFineRepository
  ) {}

  public async execute(userId: string): Promise<IFine[]> {
    return this.fineRepository.findPendingByUserId(userId);
  }
}

export { ViewFineByUser };
