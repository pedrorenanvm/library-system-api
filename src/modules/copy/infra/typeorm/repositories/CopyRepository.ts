// src/modules/copy/infra/typeorm/repositories/CopyRepository.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import {
  ICopyRepository,
  ICopyPaginate,
  SearchCopyParams,
} from '@modules/copy/domain/repositories/ICopyRepository';
import { ICopy } from '@modules/copy/domain/models/ICopy';
import { ICreateCopy } from '@modules/copy/domain/models/ICreateCopy';
import { Copy, CopyStatus } from '../entities/Copy';

export class CopyRepository implements ICopyRepository {
  private ormRepository: Repository<Copy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Copy);
  }

  async create(data: ICreateCopy): Promise<ICopy> {
    const copy = this.ormRepository.create(data);
    await this.ormRepository.save(copy);
    return copy;
  }

  async findAll(params: SearchCopyParams): Promise<ICopyPaginate> {
    const { limit, page, titleId, status, barcode } = params;
    const query = this.ormRepository
      .createQueryBuilder('copy')
      .leftJoinAndSelect('copy.title', 'title');

    if (titleId) query.andWhere('copy.title_id = :titleId', { titleId });
    if (status) query.andWhere('copy.status = :status', { status });
    if (barcode)
      query.andWhere('copy.barcode ILIKE :barcode', {
        barcode: `%${barcode}%`,
      });

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      per_page: limit,
      data,
      total,
      current_page: page,
      last_page: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<ICopy | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: ['title'],
    });
  }

  async findByBarcode(barcode: string): Promise<ICopy | null> {
    return await this.ormRepository.findOne({
      where: { barcode },
      relations: ['title'],
    });
  }

  async update(copy: ICopy): Promise<ICopy> {
    await this.ormRepository.save(copy);
    return copy;
  }

  async updateStatus(id: string, status: CopyStatus): Promise<void> {
    await this.ormRepository.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  async countByTitleAndStatus(
    titleId: string,
    status: CopyStatus
  ): Promise<number> {
    return await this.ormRepository.count({ where: { titleId, status } });
  }
}

