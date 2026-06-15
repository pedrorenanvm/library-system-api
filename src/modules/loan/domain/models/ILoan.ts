import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { ICopy } from '@modules/copy/domain/models/ICopy';
import { IFine } from '@modules/fine/domain/models/IFine';

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
  copy?: ICopy;
  fine?: IFine | null;
}