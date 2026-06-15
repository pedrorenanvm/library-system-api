import { LossStatus } from '../../infra/typeorm/entities/Loss';

export interface ICreateLoss {
  copyId: string;
  userId: string;
  notes: string | null;
  replacementFee: number | null;
  status: LossStatus;
  reportedAt: Date;
}
