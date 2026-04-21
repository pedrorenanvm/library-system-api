import { UserRole } from '@modules/user/infra/typeorm/entities/User';

export interface IUser {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  phone: string | null;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
