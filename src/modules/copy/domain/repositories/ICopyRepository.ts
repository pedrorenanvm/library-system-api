// src/modules/copy/domain/repositories/ICopyRepository.ts
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { ICopy } from '../models/ICopy';
import { ICreateCopy } from '../models/ICreateCopy';

export interface ICopyPaginate {
  data: ICopy[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface SearchCopyParams {
  page: number;
  limit: number;
  titleId?: string;
  status?: CopyStatus;
  barcode?: string;
}

export interface ICopyRepository {
  create(data: ICreateCopy): Promise<ICopy>;
  findAll(params: SearchCopyParams): Promise<ICopyPaginate>;
  findById(id: string): Promise<ICopy | null>;
  findByBarcode(barcode: string): Promise<ICopy | null>;
  update(copy: ICopy): Promise<ICopy>;
  updateStatus(id: string, status: CopyStatus): Promise<void>;
  delete(id: string): Promise<void>;
  countByTitleAndStatus(titleId: string, status: CopyStatus): Promise<number>;
}

