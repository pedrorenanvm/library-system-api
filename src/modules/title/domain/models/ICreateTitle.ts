import { TitleType } from '@modules/title/infra/typeorm/entities/Title';

export interface ICreateTitle {
    name: string;
    description?: string | null;
    type: TitleType;
    maxLoanDays: number;
    totalCopies: number;
} 