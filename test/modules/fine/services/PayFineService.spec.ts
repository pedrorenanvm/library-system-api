import 'reflect-metadata';
import AppError from '@shared/errors/AppError';
import PayFineService from '@modules/fine/services/PayFineService';
import { FineStatus } from '@modules/fine/infra/typeorm/entities/Fine';

const makeFine = (overrides = {}) => ({
  id: 'fine-id',
  loanId: 'loan-id',
  amount: 5,
  overdueDays: 5,
  status: FineStatus.PENDING,
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeFineRepository = (fine: any) => ({
  findById: jest.fn().mockResolvedValue(fine),
  update: jest.fn().mockImplementation(async (f) => f),
});

describe('PayFineService', () => {
  it('throws if fine not found', async () => {
    const sut = new PayFineService(makeFineRepository(null) as any);
    await expect(sut.execute('fine-id')).rejects.toBeInstanceOf(AppError);
  });

  it('throws if fine is not pending', async () => {
    const sut = new PayFineService(
      makeFineRepository(makeFine({ status: FineStatus.PAID })) as any
    );
    await expect(sut.execute('fine-id')).rejects.toBeInstanceOf(AppError);
  });

  it('sets status to PAID and paidAt on success', async () => {
    const repo = makeFineRepository(makeFine());
    const sut = new PayFineService(repo as any);
    const result = await sut.execute('fine-id');
    expect(result.status).toBe(FineStatus.PAID);
    expect(result.paidAt).toBeInstanceOf(Date);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('throws if fine is waived', async () => {
    const sut = new PayFineService(
      makeFineRepository(makeFine({ status: FineStatus.WAIVED })) as any
    );
    await expect(sut.execute('fine-id')).rejects.toBeInstanceOf(AppError);
  });
});
