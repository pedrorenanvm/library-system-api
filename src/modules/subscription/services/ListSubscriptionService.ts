import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ISubscriptionRepository } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';
import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';

interface IRequest {
  status?: SubscriptionStatus;
}

@injectable()
class ListSubscriptionService {
  constructor(
    @inject(REPOSITORY_KEYS.SubscriptionRepository)
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  public async execute({ status }: IRequest): Promise<ISubscription[]> {
    return this.subscriptionRepository.findAll({ status });
  }
}

export default ListSubscriptionService;