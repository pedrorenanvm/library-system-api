import { Repository } from 'typeorm';
import { Loss } from '../entities/Loss';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { ILossRepository } from '@modules/loss/domain/repositories/ILossRepository';
import { ILoss } from '@modules/loss/domain/models/ILoss';
import { ICreateLoss } from '@modules/loss/domain/models/ICreateLoss';

class LossRepository implements ILossRepository {
  private ormRepository: Repository<Loss>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Loss);
  }
  async create(data: ICreateLoss): Promise<ILoss> {
    const dt = this.ormRepository.create(data);
    await this.ormRepository.save(dt);
    return dt;
  }
  async update(loss: ILoss): Promise<ILoss> {
    await this.ormRepository.save(loss);
    return loss;
  }
  async findById(id: string): Promise<ILoss | null> {
    return await this.ormRepository.findOne({
      where: { id },
    });
  }
  async findAll(): Promise<ILoss[]> {
    return this.ormRepository.find({
      relations: ['copy', 'user'],
      order: {
        reportedAt: 'DESC',
      },
    });
  }

  async findByCopyId(copyId: string): Promise<ILoss | null> {
    return this.ormRepository.findOne({
      where: { copyId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }
}
