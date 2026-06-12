import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ISubscriptionRepository } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';
import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import AppError from '@shared/errors/AppError';

interface IRequest {
  titleId: string;
  publisher?: string | null;
  startDate: Date;
  endDate: Date;
  cost?: number | null;
  renewalFrequency?: string | null;
}

@injectable()
class CreateSubscriptionService {
  constructor(
    @inject(REPOSITORY_KEYS.SubscriptionRepository)
    private subscriptionRepository: ISubscriptionRepository,

    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute({
    titleId,
    publisher,
    startDate,
    endDate,
    cost,
    renewalFrequency,
  }: IRequest): Promise<ISubscription> {
    
    const title = await this.titleRepository.findById(titleId);
    if (!title) {
      throw new AppError('Título não encontrado.', 404);
    }
    if (title.type !== TitleType.PERIODICAL) {
      throw new AppError(
        'Assinaturas só podem ser criadas para títulos do tipo periódico.',
        422
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new AppError(
        'A data de início deve ser anterior à data de vencimento.',
        422
      );
    }

    const activeSubscription =
      await this.subscriptionRepository.findActiveByTitleId(titleId);
    if (activeSubscription) {
      throw new AppError(
        'Já existe uma assinatura ativa para este periódico.',
        409
      );
    }

    const subscription = await this.subscriptionRepository.create({
      titleId,
      publisher: publisher ?? null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: SubscriptionStatus.ACTIVE,
      cost: cost ?? null,
      renewalFrequency: renewalFrequency ?? null,
    });

    return subscription;
  }
}

export default CreateSubscriptionService;