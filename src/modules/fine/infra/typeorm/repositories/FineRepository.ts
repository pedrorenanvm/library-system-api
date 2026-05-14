import { IFineRepository } from '@modules/fine/domain/repositories/IFineRepository';
import { Repository } from 'typeorm';
import { Fine, FineStatus } from '../entities/Fine';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { IFine } from '@modules/fine/domain/models/IFine';
import { ICreateFine } from '@modules/fine/domain/models/ICreateFine';

export class FineRepository implements IFineRepository {
  private ormRepository: Repository<Fine>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Fine);
  }

  async findById(id: string): Promise<IFine | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }
  async create(data: ICreateFine): Promise<IFine> {
    const fine = this.ormRepository.create(data);
    await this.ormRepository.save(fine);
    return fine;
  }
  async findByLoanId(loanId: string): Promise<IFine | null> {
    return await this.ormRepository.findOne({ where: { loanId } });
  }
  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }
  async update(fine: IFine): Promise<IFine> {
    await this.ormRepository.save(fine);
    return fine;
  }
  async findPendingByUserId(userId: string): Promise<IFine | null> {
    return (
      this.ormRepository
        .createQueryBuilder('fine')
        .innerJoin('fine.loan', 'loan')
        .where('loan.userId = :userId', { userId })
        .andWhere('fine.status = :status', { status: FineStatus.PENDING })
        .getOne() ?? null
    );
  }
}
