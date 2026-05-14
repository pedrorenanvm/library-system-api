import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';

export interface ILoan {
  id: string;
  copyId: string;
  userId: string;
  loanedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}