import CreateFineService from '@modules/fine/services/CreateFineService';
import PayFineService from '@modules/fine/services/PayFineService';
import ViewFineService from '@modules/fine/services/ViewFineService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class FineController {
  async create(req: Request, res: Response): Promise<Response> {
    const { loanId, amount, overdueDays } = req.body;
    const createFine = container.resolve(CreateFineService);
    const fine = await createFine.execute({ loanId, amount, overdueDays });
    return res.status(201).json(instanceToPlain(fine));
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const viewFine = container.resolve(ViewFineService);
    const fine = await viewFine.execute(id);
    return res.status(200).json(instanceToPlain(fine));
  }

  async pay(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const payFine = container.resolve(PayFineService);
    const fine = await payFine.execute(id);
    return res.status(200).json(instanceToPlain(fine));
  }
}
