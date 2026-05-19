import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { IFineRepository } from '@modules/fine/domain/repositories/IFineRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { IFine } from '@modules/fine/domain/models/IFine';
import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import CalculateFineService from '@modules/fine/services/CalculateFineService';
import CreateFineService from '@modules/fine/services/CreateFineService';
import AppError from '@shared/errors/AppError';

interface IRequest {
  loanId: string;
}

interface IResponse {
  loan: ILoan;
  fine: IFine | null;
}

const RETURNABLE_STATUSES: LoanStatus[] = [
  LoanStatus.ACTIVE,
  LoanStatus.OVERDUE,
];

@injectable()
class ReturnLoanService {
  constructor(
    @inject(REPOSITORY_KEYS.LoanRepository)
    private loanRepository: ILoanRepository,

    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository,

    @inject(REPOSITORY_KEYS.FineRepository)
    private fineRepository: IFineRepository,

    @inject(CalculateFineService)
    private calculateFineService: CalculateFineService,

    @inject(CreateFineService)
    private createFineService: CreateFineService
  ) {}

  public async execute({ loanId }: IRequest): Promise<IResponse> {

    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new AppError('Empréstimo não encontrado.', 404);
    }

    if (!RETURNABLE_STATUSES.includes(loan.status)) {
      throw new AppError(
        `Empréstimo não pode ser devolvido pois está com status "${loan.status}".`,
        422
      );
    }

    const amount = await this.calculateFineService.execute({ loanId });

    const updatedLoan = await this.loanRepository.update({
      ...loan,
      returnedAt: new Date(),
      status: LoanStatus.RETURNED,
    });

    let fine: IFine | null = null;
    if (amount > 0) {
      const fineAlreadyExists = await this.fineRepository.findByLoanId(loanId);

      if (!fineAlreadyExists) {
        const overdueDays = this.calculateOverdueDays(loan.dueDate);
        fine = await this.createFineService.execute({
          loanId,
          amount,
          overdueDays,
        });
      } else {
        fine = fineAlreadyExists;
      }
    }

    await this.copyRepository.updateStatus(loan.copyId, CopyStatus.AVAILABLE);

    return { loan: updatedLoan, fine };
  }

  private calculateOverdueDays(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (today <= due) return 0;

    return Math.floor(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}

export default ReturnLoanService;