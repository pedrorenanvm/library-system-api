import { ITitle } from './ITitle';

export interface ITitlePaginate {
  per_page: number;
  total: number;
  current_page: number;
  data: ITitle[];
  last_page?: number;
}
