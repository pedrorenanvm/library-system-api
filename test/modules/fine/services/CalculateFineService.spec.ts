import 'reflect-metadata';
import AppError from '@shared/errors/AppError';
import CalculateFineService from '@modules/fine/services/CalculateFineService';

const makeLoanRepository = (loan: any) => ({
  findById: jest.fn().mockResolvedValue(loan),
});

describe('CalculateFineService', () => {
  it('throws if loan not found', async () => {
    const sut = new CalculateFineService(makeLoanRepository(null) as any);
    await expect(sut.execute({ loanId: '1' })).rejects.toBeInstanceOf(AppError);
  });

  it('returns 0 when not overdue', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const sut = new CalculateFineService(
      makeLoanRepository({ dueDate: future }) as any
    );
    expect(await sut.execute({ loanId: '1' })).toBe(0);
  });

  it('calculates fine correctly for overdue loan', async () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const sut = new CalculateFineService(
      makeLoanRepository({ dueDate: past }) as any
    );
    expect(await sut.execute({ loanId: '1' })).toBe(5);
  });

  it('returns 0 on due date', async () => {
    const today = new Date();
    const sut = new CalculateFineService(
      makeLoanRepository({ dueDate: today }) as any
    );
    expect(await sut.execute({ loanId: '1' })).toBe(0);
  });
});
