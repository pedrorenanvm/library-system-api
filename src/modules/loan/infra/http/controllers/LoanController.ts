import CreateLoanService from '@modules/loan/services/CreateLoanService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToPlain } from 'class-transformer';
import ReturnLoanService from '@modules/loan/services/ReturnLoanService';

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
}