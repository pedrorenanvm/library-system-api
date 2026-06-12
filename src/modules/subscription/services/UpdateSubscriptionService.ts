import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ISubscriptionRepository } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';
import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';
import AppError from '@shared/errors/AppError';

type SubscriptionAction = 'renew' | 'cancel';

interface IRequest {
  id: string;
  action: SubscriptionAction;
  newEndDate?: Date;
}

@injectable()
class UpdateSubscriptionService {
  constructor(
    @inject(REPOSITORY_KEYS.SubscriptionRepository)
    private subscriptionRepository: ISubscriptionRepository
  ) {}

  public async execute({ id, action, newEndDate }: IRequest): Promise<ISubscription> {
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new AppError('Assinatura não encontrada.', 404);
    }
    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new AppError('Não é possível alterar uma assinatura cancelada.', 422);
    }

    if (action === 'renew') {
      if (!newEndDate) {
        throw new AppError(
          'Nova data de vencimento é obrigatória para renovação.',
          422
        );
      }
      if (new Date(newEndDate) <= new Date(subscription.endDate)) {
        throw new AppError(
          'A nova data de vencimento deve ser posterior à data atual.',
          422
        );
      }

      return this.subscriptionRepository.update({
        ...subscription,
        endDate: new Date(newEndDate),
        status: SubscriptionStatus.ACTIVE,
      });
    }

    return this.subscriptionRepository.update({
      ...subscription,
      status: SubscriptionStatus.CANCELLED,
    });
  }
}

export default UpdateSubscriptionService;