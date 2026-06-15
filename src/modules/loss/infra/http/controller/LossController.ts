import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToPlain } from 'class-transformer';

import CreateLossService from '@modules/loss/services/CreateLossService';
import ListLossesService from '@modules/loss/services/ListLossesService';
import ShowLossService from '@modules/loss/services/ShowLossService';
import UpdateLossService from '@modules/loss/services/UpdateLossService';
import DeleteLossService from '@modules/loss/services/DeleteLossService';

export default class LossController {
  async create(req: Request, res: Response): Promise<Response> {
    const { copyId, userId, notes, replacementFee } = req.body;

    const service = container.resolve(CreateLossService);

    const loss = await service.execute({
      copyId,
      userId,
      notes,
      replacementFee,
    });

    return res.status(201).json(instanceToPlain(loss));
  }

  async index(req: Request, res: Response): Promise<Response> {
    const service = container.resolve(ListLossesService);

    const losses = await service.execute();

    return res.json(instanceToPlain(losses));
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const service = container.resolve(ShowLossService);

    const loss = await service.execute({ id });

    return res.json(instanceToPlain(loss));
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const { notes, replacementFee, status } = req.body;

    const service = container.resolve(UpdateLossService);

    const loss = await service.execute({
      id,
      notes,
      replacementFee,
      status,
    });

    return res.json(instanceToPlain(loss));
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const service = container.resolve(DeleteLossService);

    await service.execute({ id });

    return res.status(204).send();
  }
}
