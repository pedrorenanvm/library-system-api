import CreateSubscriptionService from '@modules/subscription/services/CreateSubscriptionService';
import ListSubscriptionService from '@modules/subscription/services/ListSubscriptionService';
import UpdateSubscriptionService from '@modules/subscription/services/UpdateSubscriptionService';
import CheckExpiringSubscriptionsService from '@modules/subscription/services/CheckExpiringSubscriptionsService';
import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class SubscriptionController {
  async create(req: Request, res: Response): Promise<Response> {
    const { titleId, publisher, startDate, endDate, cost, renewalFrequency } =
      req.body;

    const service = container.resolve(CreateSubscriptionService);
    const subscription = await service.execute({
      titleId,
      publisher,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      cost,
      renewalFrequency,
    });

    return res.status(201).json(instanceToPlain(subscription));
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { status } = req.query as { status?: SubscriptionStatus };

    const service = container.resolve(ListSubscriptionService);
    const subscriptions = await service.execute({ status });

    return res.status(200).json(instanceToPlain(subscriptions));
}

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { action, newEndDate } = req.body;

    const service = container.resolve(UpdateSubscriptionService);
    const subscription = await service.execute({
      id,
      action,
      newEndDate: newEndDate ? new Date(newEndDate) : undefined,
    });

    return res.status(200).json(instanceToPlain(subscription));
  }

  async expiring(req: Request, res: Response): Promise<Response> {
    const days = req.query.days ? Number(req.query.days) : 30;

    const service = container.resolve(CheckExpiringSubscriptionsService);
    const subscriptions = await service.execute({ days });

    return res.status(200).json(instanceToPlain(subscriptions));
  }
}