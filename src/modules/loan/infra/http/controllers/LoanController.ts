import CreateLoanService from '@modules/loan/services/CreateLoanService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToPlain } from 'class-transformer';

export default class LoanController {
  async create(req: Request, res: Response): Promise<Response> {
    const { userId, copyId } = req.body;

    const createLoan = container.resolve(CreateLoanService);

    const loan = await createLoan.execute({ userId, copyId });

    return res.status(201).json(instanceToPlain(loan));
  }
}