import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { IVerifyLoan } from '../domain/models/IVerifyLoan';
import AppError from '@shared/errors/AppError';
import { FINE_FOR_DAY } from '@helpers/FineForDay';

@injectable()
class CalculateFineService {
  constructor(
    @inject(REPOSITORY_KEYS.LoanRepository)
    private loanRepository: ILoanRepository
  ) {}

  public async execute({ loanId }: IVerifyLoan): Promise<number> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) throw new AppError('Emprestimo não encontrado');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (today <= dueDate) return 0;

    const overdueDays = Math.floor(
      (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const amount = overdueDays * FINE_FOR_DAY;
    return amount;
  }
}

export default CalculateFineService;
