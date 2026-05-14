import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { IFineRepository } from '../domain/repositories/IFineRepository';
import { ICreateFine } from '../domain/models/ICreateFine';
import AppError from '@shared/errors/AppError';

@injectable()
class CreateFineService {
  constructor(
    @inject(REPOSITORY_KEYS.FineRepository)
    private fineRepository: IFineRepository
  ) {}

  public async execute({ loanId, amount, overdueDays }: ICreateFine) {
    const loanExist = await this.fineRepository.findByLoanId(loanId);

    if (loanExist) throw new AppError('Emprestimo já tem uma multa cadastrada');

    if (amount <= 0) {
      throw new AppError('Multa deve ter valor positivo');
    }

    return await this.fineRepository.create({ loanId, amount, overdueDays });
  }
}

export default CreateFineService;
