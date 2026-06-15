import { ICreateLoss } from '../models/ICreateLoss';
import { ILoss } from '../models/ILoss';

export interface ILossRepository {
  findById(id: string): Promise<ILoss | null>;
  findByCopyId(copyId: string): Promise<ILoss | null>;
  findAll(): Promise<ILoss[]>;
  create(data: ICreateLoss): Promise<ILoss>;
  update(loss: ILoss): Promise<ILoss>;
  delete(id: string): Promise<void>;
}
