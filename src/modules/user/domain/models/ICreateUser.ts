import { UserRole } from '@modules/user/infra/typeorm/entities/User';

export interface ICreateUser {
  name: string;
  email: string;
  registrationNumber: string;
  password: string;
  phone?: string | null;
  role: UserRole;
}
