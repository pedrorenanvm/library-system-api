import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { IFineRepository } from '../domain/repositories/IFineRepository';
import { FineStatus } from '../infra/typeorm/entities/Fine';
import AppError from '@shared/errors/AppError';
import { IFine } from '../domain/models/IFine';

@injectable()
class PayFineService {
  constructor(
    @inject(REPOSITORY_KEYS.FineRepository)
    private fineRepository: IFineRepository
  ) {}

  public async execute(id: string): Promise<IFine> {
    const fine = await this.fineRepository.findById(id);

    if (!fine) throw new AppError('Multa não encontrada');
    if (fine.status !== FineStatus.PENDING)
      throw new AppError('Multa não está pendente');

    fine.status = FineStatus.PAID;
    fine.paidAt = new Date();

    return await this.fineRepository.update(fine);
  }
}

export default PayFineService;
