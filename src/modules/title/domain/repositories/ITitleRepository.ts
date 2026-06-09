import { ICreateTitle } from '../models/ICreateTitle';
import { IGetTitleFilters } from '../models/IGetTitleFilters';
import { ITitle } from '../models/ITitle';
import { ITitlePaginate } from '../models/ITitlePaginate';

export interface ITitleRepository {
  findById(id: string): Promise<ITitle | null>;
  findByName(name: string): Promise<ITitle | null>;
  findAll(data: IGetTitleFilters): Promise<ITitlePaginate>;
  create(data: ICreateTitle): Promise<ITitle>;
  update(title: ITitle): Promise<ITitle>;
  delete(id: string): Promise<void>;
}
