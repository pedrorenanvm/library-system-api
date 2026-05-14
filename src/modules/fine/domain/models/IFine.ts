import { FineStatus } from '@modules/fine/infra/typeorm/entities/Fine';

export interface IFine {
  id: string;
  loanId: string;
  amount: number;
  overdueDays: number;
  status: FineStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
