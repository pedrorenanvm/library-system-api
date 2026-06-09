import { Title } from '@modules/title/infra/typeorm/entities/Title';
import { ITitleRepository } from '../../../domain/repositories/ITitleRepository';
import { Repository } from 'typeorm';
import { ITitle } from '@modules/title/domain/models/ITitle';
import { ICreateTitle } from '@modules/title/domain/models/ICreateTitle';
import { IGetTitleFilters } from '@modules/title/domain/models/IGetTitleFilters';
import { ITitlePaginate } from '@modules/title/domain/models/ITitlePaginate';

export class TitleRepository implements ITitleRepository {
  private ormRepository: Repository<Title>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Title);
  }

  async findAll(data: IGetTitleFilters): Promise<ITitlePaginate> {
    const { page = 0, limit = 0, type } = data;

    const query = this.ormRepository.createQueryBuilder('title');

    if (type) {
      query.where('title.type = :type', { type });
    }

    const [dataTotal, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const result: ITitlePaginate = {
      per_page: limit,
      data: dataTotal,
      total,
      current_page: page,
      last_page: Math.ceil(total / limit),
    };
    return result;
  }

  async findById(id: string): Promise<ITitle | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<ITitle | null> {
    return await this.ormRepository.findOne({ where: { name } });
  }

  async create(data: ICreateTitle): Promise<ITitle> {
    const title = this.ormRepository.create(data);
    await this.ormRepository.save(title);
    return title;
  }

  async update(title: ITitle): Promise<ITitle> {
    await this.ormRepository.save(title);
    return title;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }
}

