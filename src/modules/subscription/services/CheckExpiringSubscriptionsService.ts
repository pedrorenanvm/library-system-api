import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ISubscriptionRepository } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';

const DEFAULT_EXPIRING_DAYS = 30;

interface IRequest {
  days?: number;
}

@injectable()
class CheckExpiringSubscriptionsService {
  constructor(
    @inject(REPOSITORY_KEYS.SubscriptionRepository)
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  public async execute({
    days = DEFAULT_EXPIRING_DAYS,
  }: IRequest): Promise<ISubscription[]> {
    return this.subscriptionRepository.findExpiring(days);
  }
}

export default CheckExpiringSubscriptionsService;