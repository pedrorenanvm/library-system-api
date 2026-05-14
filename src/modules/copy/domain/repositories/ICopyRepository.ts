import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { ICopy } from '../models/ICopy';

export interface ICopyRepository {
  findById(id: string): Promise<ICopy | null>;
  updateStatus(id: string, status: CopyStatus): Promise<void>;
}