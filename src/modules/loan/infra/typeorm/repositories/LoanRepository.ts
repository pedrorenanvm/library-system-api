import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { ICreateLoan } from '@modules/loan/domain/models/ICreateLoan';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { Loan } from '../entities/Loan';

export class LoanRepository implements ILoanRepository {
  private ormRepository: Repository<Loan>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Loan);
  }

  async findById(id: string): Promise<ILoan | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async create(data: ICreateLoan): Promise<ILoan> {
    const loan = this.ormRepository.create(data);
    await this.ormRepository.save(loan);
    return loan;
  }

  async update(loan: ILoan): Promise<ILoan> {
    await this.ormRepository.save(loan);
    return loan;
  }
}