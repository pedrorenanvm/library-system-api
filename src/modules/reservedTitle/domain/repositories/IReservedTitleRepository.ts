import { ICreateReservedTitle } from '../models/ICreateReservedTitle';
import { IReservedTitle } from '../models/IReservedTitle';

export interface IReservedTitleRepository {
  findById(id: string): Promise<IReservedTitle | null>;
  findActiveByTitleId(titleId: string, date: Date): Promise<IReservedTitle | null>;
  findOverlapping(titleId: string, startsAt: Date, endsAt: Date): Promise<IReservedTitle | null>;
  create(data: ICreateReservedTitle): Promise<IReservedTitle>;
  update(reservation: IReservedTitle): Promise<IReservedTitle>;
  delete(id: string): Promise<void>;
}