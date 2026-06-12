import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';
import { ICreateSubscription } from '../models/ICreateSubscription';
import { ISubscription } from '../models/ISubscription';

export interface IListSubscriptionFilters {
  status?: SubscriptionStatus;
}

export interface ISubscriptionRepository {
  findById(id: string): Promise<ISubscription | null>;
  findActiveByTitleId(titleId: string): Promise<ISubscription | null>;
  findAll(filters: IListSubscriptionFilters): Promise<ISubscription[]>;
  findExpiring(days: number): Promise<ISubscription[]>;
  create(data: ICreateSubscription): Promise<ISubscription>;
  update(subscription: ISubscription): Promise<ISubscription>;
  delete(id: string): Promise<void>;
}