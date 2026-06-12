import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';

export interface ICreateCopy {
  barcode: string;
  titleId: string;
  status?: CopyStatus;
}
