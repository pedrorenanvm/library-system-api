import CreateCopyService from '@modules/copy/service/CreateCopyService';
import DeleteCopyService from '@modules/copy/service/DeleteCopyService';
import ListCopiesService from '@modules/copy/service/ListCopiesService';
import ShowCopyService from '@modules/copy/service/ShowCopyService';
import UpdateCopyService from '@modules/copy/service/UpdateCopyService';
import UpdateCopyStatusService from '@modules/copy/service/UpdateCopyStatusService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class CopyController {
  async create(req: Request, res: Response): Promise<Response> {
    const { barcode, titleId } = req.body;
    const createCopy = container.resolve(CreateCopyService);
    const copy = await createCopy.execute({ barcode, titleId });

    return res.status(201).json(instanceToPlain(copy));
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { barcode, titleId } = req.body;
    const updateCopy = container.resolve(UpdateCopyService);
    const copy = await updateCopy.execute({ id, barcode, titleId });

    return res.json(instanceToPlain(copy));
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { page = 1, limit = 10, titleId, status, barcode } = req.query;
    const listCopies = container.resolve(ListCopiesService);
    const copies = await listCopies.execute({
      page: Number(page),
      limit: Number(limit),
      titleId: titleId as string,
      status: status as any,
      barcode: barcode as string,
    });

    return res.json(instanceToPlain(copies));
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const showCopy = container.resolve(ShowCopyService);
    const copy = await showCopy.execute(id);

    return res.json(instanceToPlain(copy));
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { status } = req.body;
    const updateCopyStatus = container.resolve(UpdateCopyStatusService);
    await updateCopyStatus.execute({ id, status });

    return res.status(204).send();
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deleteCopy = container.resolve(DeleteCopyService);
    await deleteCopy.execute(id);

    return res.status(204).send();
  }
}
