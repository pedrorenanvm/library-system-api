import { LossStatus } from '../../infra/typeorm/entities/Loss';

export interface ILoss {
  id: string;
  copyId: string;
  userId: string;
  notes: string | null;
  replacementFee: number | null;
  status: LossStatus;
  reportedAt: Date;
  createdAt: Date;
}
