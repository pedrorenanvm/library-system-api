import { IUser } from '../models/IUser';
import { ICreateUser } from '../models/ICreateUser';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';

export interface SearchParams {
  page: number;
  limit: number;
  name?: string;
  role?: UserRole;
}

export interface IUserPaginate {
  data: IUser[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByRegistrationNumber(registrationNumber: string): Promise<IUser | null>;
  findAll(params: SearchParams): Promise<IUserPaginate>;
  verifyRole(id: string): Promise<IUser | null>;
  create(data: ICreateUser): Promise<IUser>;
  update(user: IUser): Promise<IUser>;
  delete(id: string): Promise<void>;
}
