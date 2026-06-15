import CreateLoanService from '@modules/loan/services/CreateLoanService';
import ReturnLoanService from '@modules/loan/services/ReturnLoanService';
import ListLoansByUserService from '@modules/loan/services/ListLoansByUserService';
import { instanceToPlain } from 'class-transformer';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import AppError from '@shared/errors/AppError';

export default class LoanController {
  async create(req: Request, res: Response): Promise<Response> {
    const { userId, copyId } = req.body;

    const createLoan = container.resolve(CreateLoanService);
    const loan = await createLoan.execute({ userId, copyId });

    return res.status(201).json(instanceToPlain(loan));
  }

  async return(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const returnLoan = container.resolve(ReturnLoanService);
    const { loan, fine } = await returnLoan.execute({ loanId: id });

    return res.status(200).json(
      instanceToPlain({
        loan,
        fine,
        message: fine
          ? `Devolução registrada. Multa gerada: R$ ${Number(fine.amount).toFixed(2)} (${fine.overdueDays} dia(s) de atraso).`
          : 'Devolução registrada dentro do prazo.',
      })
    );
  }

  async listByUser(req: Request, res: Response): Promise<Response> {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      throw new AppError('O parâmetro userId é obrigatório.', 422);
    }

    const listLoans = container.resolve(ListLoansByUserService);
    const loans = await listLoans.execute({ userId });

    return res.status(200).json(instanceToPlain(loans));
  }
}