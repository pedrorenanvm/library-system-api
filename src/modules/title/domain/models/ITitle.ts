import { TitleType } from '@modules/title/infra/typeorm/entities/Title';

export interface ITitle {
  id: string;
  name: string;
  description: string | null;
  type: TitleType;
  maxLoanDays: number;
  totalCopies: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

} 