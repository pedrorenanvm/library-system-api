import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { IReservedTitleRepository } from '@modules/reservedTitle/domain/repositories/IReservedTitleRepository';
import { ICreateReservedTitle } from '@modules/reservedTitle/domain/models/ICreateReservedTitle';
import { IReservedTitle } from '@modules/reservedTitle/domain/models/IReservedTitle';
import { ReservedTitle } from '../entities/ReservedTitle';

export class ReservedTitleRepository implements IReservedTitleRepository {
  private ormRepository: Repository<ReservedTitle>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(ReservedTitle);
  }

  async findById(id: string): Promise<IReservedTitle | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  async findActiveByTitleId(
    titleId: string,
    date: Date
  ): Promise<IReservedTitle | null> {
    return this.ormRepository
      .createQueryBuilder('rt')
      .where('rt.title_id = :titleId', { titleId })
      .andWhere('rt.in_library_only = true')
      .andWhere('rt.starts_at <= :date', { date })
      .andWhere('rt.ends_at >= :date', { date })
      .getOne();
  }

  async findOverlapping(
    titleId: string,
    startsAt: Date,
    endsAt: Date
  ): Promise<IReservedTitle | null> {
    return this.ormRepository
      .createQueryBuilder('rt')
      .where('rt.title_id = :titleId', { titleId })
      .andWhere('rt.starts_at <= :endsAt', { endsAt })
      .andWhere('rt.ends_at >= :startsAt', { startsAt })
      .getOne();
  }

  async create(data: ICreateReservedTitle): Promise<IReservedTitle> {
    const reservation = this.ormRepository.create(data);
    await this.ormRepository.save(reservation);
    return reservation;
  }

  async update(reservation: IReservedTitle): Promise<IReservedTitle> {
    await this.ormRepository.save(reservation);
    return reservation;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }
}