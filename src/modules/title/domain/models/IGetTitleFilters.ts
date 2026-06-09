import { TitleType } from '@modules/title/infra/typeorm/entities/Title';

export interface IGetTitleFilters {
  page: number;
  limit: number;
  type: TitleType;
}
