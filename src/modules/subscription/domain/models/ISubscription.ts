import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';

export interface ISubscription {
  id: string;
  titleId: string;
  publisher: string | null;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  cost: number | null;
  renewalFrequency: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}