import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';

export interface ICreateSubscription {
  titleId: string;
  publisher?: string | null;
  startDate: Date;
  endDate: Date;
  status?: SubscriptionStatus;
  cost?: number | null;
  renewalFrequency?: string | null;
}