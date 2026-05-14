import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { IFine } from '../domain/models/IFine';
import { IFineRepository } from '../domain/repositories/IFineRepository';
import AppError from '@shared/errors/AppError';

@injectable()
class ViewFineService {
  constructor(
    @inject(REPOSITORY_KEYS.FineRepository)
    private fineRepository: IFineRepository
  ) {}

  public async execute(id: string): Promise<IFine> {
    const fineExist = await this.fineRepository.findById(id);

    if (!fineExist) throw new AppError('Multa não existe');

    return fineExist;
  }
}

export default ViewFineService;
