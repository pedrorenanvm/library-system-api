import {
  IUserPaginate,
  IUserRepository,
  SearchParams,
} from '@modules/user/domain/repositories/IUserRepository';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '@shared/infra/typeorm/dataSource';
import { ICreateUser } from '@modules/user/domain/models/ICreateUser';
import { IUser } from '@modules/user/domain/models/IUser';

export class UserRepository implements IUserRepository {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  async create(data: ICreateUser): Promise<IUser> {
    const user = this.ormRepository.create(data);
    await this.ormRepository.save(user);
    return user;
  }
  async findAll(params: SearchParams): Promise<IUserPaginate> {
    const { limit, page, name, role } = params;
    const query = this.ormRepository.createQueryBuilder('user');
    if (name) query.where('user.name ILIKE :name', { name: `%${name}%` });
    if (role) query.andWhere('user.role = :role', { role });

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

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.ormRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<IUser | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async findByRegistrationNumber(
    registrationNumber: string
  ): Promise<IUser | null> {
    return await this.ormRepository.findOne({ where: { registrationNumber } });
  }

  async update(user: IUser): Promise<IUser> {
    await this.ormRepository.save(user);
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.softDelete(id);
  }

  async verifyRole(id: string): Promise<IUser | null> {
    const user = await this.ormRepository.findOne({
      where: {
        id: id,
      },
      select: ['role'],
    });
    return user ?? null;
  }
}
