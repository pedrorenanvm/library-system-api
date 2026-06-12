import CreateReservedTitleService from '@modules/reservedTitle/services/CreateReservedTitleService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class ReservedTitleController {
  async create(req: Request, res: Response): Promise<Response> {
    const { titleId, disciplineName, startsAt, endsAt, inLibraryOnly } =
      req.body;

    const teacherId = req.user.id;

    const createReservedTitle = container.resolve(CreateReservedTitleService);

    const reservation = await createReservedTitle.execute({
      teacherId,
      titleId,
      disciplineName,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      inLibraryOnly: inLibraryOnly ?? true,
    });

    return res.status(201).json(instanceToPlain(reservation));
  }
}