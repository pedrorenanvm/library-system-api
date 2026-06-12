import { Repository, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { ISubscriptionRepository, IListSubscriptionFilters } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ICreateSubscription } from '@modules/subscription/domain/models/ICreateSubscription';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';
import { Subscription, SubscriptionStatus } from '../entities/Subscription';

export class SubscriptionRepository implements ISubscriptionRepository {
  private ormRepository: Repository<Subscription>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Subscription);
  }

  async findById(id: string): Promise<ISubscription | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  async findActiveByTitleId(titleId: string): Promise<ISubscription | null> {
    return this.ormRepository.findOne({
      where: { titleId, status: SubscriptionStatus.ACTIVE },
    });
  }

  async findAll(filters: IListSubscriptionFilters): Promise<ISubscription[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    return this.ormRepository.find({ where, order: { endDate: 'ASC' } });
  }

  async findExpiring(days: number): Promise<ISubscription[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + days);

    return this.ormRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThanOrEqual(limit),
      },
      order: { endDate: 'ASC' },
    });
  }

  async create(data: ICreateSubscription): Promise<ISubscription> {
    const subscription = this.ormRepository.create(data);
    await this.ormRepository.save(subscription);
    return subscription;
  }

  async update(subscription: ISubscription): Promise<ISubscription> {
    await this.ormRepository.save(subscription);
    return subscription;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }
}
