import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { ICopy } from '@modules/copy/domain/models/ICopy';
import { Copy, CopyStatus } from '../entities/Copy';

export class CopyRepository implements ICopyRepository {
  private ormRepository: Repository<Copy>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Copy);
  }

  async findById(id: string): Promise<ICopy | null> {
    return await this.ormRepository.findOne({
      where: { id },
      relations: ['title'],
    });
  }

  async updateStatus(id: string, status: CopyStatus): Promise<void> {
    await this.ormRepository.update(id, { status });
  }
}