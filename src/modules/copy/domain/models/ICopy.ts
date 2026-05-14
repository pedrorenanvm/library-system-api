import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { ITitle } from '@modules/title/domain/models/ITitle';

export interface ICopy {
  id: string;
  barcode: string;
  status: CopyStatus;
  titleId: string;
  title?: ITitle;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}