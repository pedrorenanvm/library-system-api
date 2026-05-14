import { ICreateFine } from '../models/ICreateFine';
import { IFine } from '../models/IFine';

export interface IFineRepository {
  findById(id: string): Promise<IFine | null>;
  findByLoanId(loanId: string): Promise<IFine | null>;
  create(data: ICreateFine): Promise<IFine>;
  update(fine: IFine): Promise<IFine>;
  delete(id: string): Promise<void>;
  findPendingByUserId(userId: string): Promise<IFine | null>;
}
