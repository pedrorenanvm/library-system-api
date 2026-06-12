import CreateTitleService from '@modules/title/services/CreateTitleService';
import UpdateTitleService from '@modules/title/services/UpdateTitleService';
import ListTitlesService from '@modules/title/services/ListTitlesService';
import ShowTitleService from '@modules/title/services/ShowTitleService';
import DeleteTitleService from '@modules/title/services/DeleteTitleService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class TitleController {
  async create(req: Request, res: Response): Promise<Response> {
    const { name, description, type, maxLoanDays, totalCopies } = req.body;
    const createTitle = container.resolve(CreateTitleService);
    const title = await createTitle.execute({
      name,
      description,
      type,
      maxLoanDays,
      totalCopies,
    });

    return res.status(201).json(instanceToPlain(title));
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { name, description, type, maxLoanDays, totalCopies } = req.body;
    const updateTitle = container.resolve(UpdateTitleService);
    const title = await updateTitle.execute({
      id,
      name,
      description,
      type,
      maxLoanDays,
      totalCopies,
    });

    return res.json(instanceToPlain(title));
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { page = 1, limit = 10, type } = req.query;
    const listTitles = container.resolve(ListTitlesService);
    const titles = await listTitles.execute({
      page: Number(page),
      limit: Number(limit),
      type: type as any,
    });

    return res.json(instanceToPlain(titles));
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const showTitle = container.resolve(ShowTitleService);
    const title = await showTitle.execute(id);

    return res.json(instanceToPlain(title));
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deleteTitle = container.resolve(DeleteTitleService);
    await deleteTitle.execute(id);

    return res.status(204).send();
  }
}

