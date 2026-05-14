import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';

export interface ICreateLoan {
  copyId: string;
  userId: string;
  loanedAt: Date;
  dueDate: Date;
  status: LoanStatus;
}