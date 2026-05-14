import { ICreateLoan } from '../models/ICreateLoan';
import { ILoan } from '../models/ILoan';

export interface ILoanRepository {
  findById(id: string): Promise<ILoan | null>;
  create(data: ICreateLoan): Promise<ILoan>;
  update(loan: ILoan): Promise<ILoan>;
}