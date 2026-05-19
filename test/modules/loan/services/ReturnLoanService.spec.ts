import 'reflect-metadata';
import ReturnLoanService from '@modules/loan/services/ReturnLoanService';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { IFineRepository } from '@modules/fine/domain/repositories/IFineRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { IFine } from '@modules/fine/domain/models/IFine';
import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { FineStatus } from '@modules/fine/infra/typeorm/entities/Fine';
import CalculateFineService from '@modules/fine/services/CalculateFineService';
import CreateFineService from '@modules/fine/services/CreateFineService';
import AppError from '@shared/errors/AppError';


const makeLoanRepositoryMock = (): jest.Mocked<ILoanRepository> => ({
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

const makeCopyRepositoryMock = (): jest.Mocked<ICopyRepository> => ({
  findById: jest.fn(),
  updateStatus: jest.fn(),
});

const makeFineRepositoryMock = (): jest.Mocked<IFineRepository> => ({
  findById: jest.fn(),
  findByLoanId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findPendingByUserId: jest.fn(),
});

const makeCalculateFineServiceMock = () => ({
  execute: jest.fn(),
});

const makeCreateFineServiceMock = () => ({
  execute: jest.fn(),
});


const daysAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const daysFromNow = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const makeLoanStub = (overrides: Partial<ILoan> = {}): ILoan => ({
  id: 'loan-uuid-001',
  copyId: 'copy-uuid-001',
  userId: 'user-uuid-001',
  loanedAt: daysAgo(7),
  dueDate: daysFromNow(7),
  returnedAt: null,
  status: LoanStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeFineStub = (overrides: Partial<IFine> = {}): IFine => ({
  id: 'fine-uuid-001',
  loanId: 'loan-uuid-001',
  amount: 3,
  overdueDays: 3,
  status: FineStatus.PENDING,
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});


describe('ReturnLoanService', () => {
  let sut: ReturnLoanService;
  let loanRepositoryMock: jest.Mocked<ILoanRepository>;
  let copyRepositoryMock: jest.Mocked<ICopyRepository>;
  let fineRepositoryMock: jest.Mocked<IFineRepository>;
  let calculateFineServiceMock: ReturnType<typeof makeCalculateFineServiceMock>;
  let createFineServiceMock: ReturnType<typeof makeCreateFineServiceMock>;

  beforeEach(() => {
    loanRepositoryMock = makeLoanRepositoryMock();
    copyRepositoryMock = makeCopyRepositoryMock();
    fineRepositoryMock = makeFineRepositoryMock();
    calculateFineServiceMock = makeCalculateFineServiceMock();
    createFineServiceMock = makeCreateFineServiceMock();

    sut = new ReturnLoanService(
      loanRepositoryMock,
      copyRepositoryMock,
      fineRepositoryMock,
      calculateFineServiceMock as unknown as CalculateFineService,
      createFineServiceMock as unknown as CreateFineService
    );
  });

  describe('Devolução no prazo', () => {
    it('deve registrar devolução sem gerar multa quando dentro do prazo', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ dueDate: daysFromNow(3) })
      );
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(0);
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({ loanId: 'loan-uuid-001' });

      expect(result.fine).toBeNull();
      expect(createFineServiceMock.execute).not.toHaveBeenCalled();
    });

    it('deve atualizar status do empréstimo para RETURNED', async () => {
      loanRepositoryMock.findById.mockResolvedValue(makeLoanStub());
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(0);
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({ loanId: 'loan-uuid-001' });

      expect(result.loan.status).toBe(LoanStatus.RETURNED);
    });

    it('deve registrar returnedAt como data atual', async () => {
      loanRepositoryMock.findById.mockResolvedValue(makeLoanStub());
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(0);
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const before = new Date();
      const result = await sut.execute({ loanId: 'loan-uuid-001' });
      const after = new Date();

      expect(result.loan.returnedAt).not.toBeNull();
      expect(result.loan.returnedAt!.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(result.loan.returnedAt!.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });

    it('deve incrementar exemplares disponíveis (status AVAILABLE)', async () => {
      loanRepositoryMock.findById.mockResolvedValue(makeLoanStub());
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(0);
      copyRepositoryMock.updateStatus.mockResolvedValue();

      await sut.execute({ loanId: 'loan-uuid-001' });

      expect(copyRepositoryMock.updateStatus).toHaveBeenCalledWith(
        'copy-uuid-001',
        CopyStatus.AVAILABLE
      );
    });
  });

  describe('Devolução com atraso', () => {
    it('deve acionar criação de multa quando amount > 0', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ dueDate: daysAgo(3) })
      );
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(3);
      fineRepositoryMock.findByLoanId.mockResolvedValue(null);
      createFineServiceMock.execute.mockResolvedValue(makeFineStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({ loanId: 'loan-uuid-001' });

      expect(result.fine).not.toBeNull();
      expect(createFineServiceMock.execute).toHaveBeenCalledTimes(1);
    });

    it('deve criar multa com status PENDING', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ dueDate: daysAgo(2) })
      );
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(2);
      fineRepositoryMock.findByLoanId.mockResolvedValue(null);
      createFineServiceMock.execute.mockResolvedValue(
        makeFineStub({ status: FineStatus.PENDING })
      );
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({ loanId: 'loan-uuid-001' });

      expect(result.fine?.status).toBe(FineStatus.PENDING);
    });

    it('não deve criar segunda multa se já existe uma para o empréstimo', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ dueDate: daysAgo(3) })
      );
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(3);
      fineRepositoryMock.findByLoanId.mockResolvedValue(makeFineStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({ loanId: 'loan-uuid-001' });

      expect(createFineServiceMock.execute).not.toHaveBeenCalled();
      expect(result.fine).not.toBeNull(); // retorna a existente
    });

    it('deve aceitar devolução de empréstimo com status OVERDUE', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ dueDate: daysAgo(5), status: LoanStatus.OVERDUE })
      );
      loanRepositoryMock.update.mockImplementation(async (l) => l);
      calculateFineServiceMock.execute.mockResolvedValue(5);
      fineRepositoryMock.findByLoanId.mockResolvedValue(null);
      createFineServiceMock.execute.mockResolvedValue(makeFineStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      await expect(
        sut.execute({ loanId: 'loan-uuid-001' })
      ).resolves.not.toThrow();
    });
  });

  describe('Validações de negócio', () => {
    it('deve lançar AppError 404 se empréstimo não encontrado', async () => {
      loanRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        sut.execute({ loanId: 'inexistente' })
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(loanRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve lançar AppError 422 se empréstimo já foi devolvido', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ status: LoanStatus.RETURNED })
      );

      await expect(
        sut.execute({ loanId: 'loan-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('deve lançar AppError 422 se empréstimo está com status LOST', async () => {
      loanRepositoryMock.findById.mockResolvedValue(
        makeLoanStub({ status: LoanStatus.LOST })
      );

      await expect(
        sut.execute({ loanId: 'loan-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('não deve liberar exemplar se atualização do loan falhar', async () => {
      loanRepositoryMock.findById.mockResolvedValue(makeLoanStub());
      loanRepositoryMock.update.mockRejectedValue(new Error('DB error'));
      calculateFineServiceMock.execute.mockResolvedValue(0);

      await expect(
        sut.execute({ loanId: 'loan-uuid-001' })
      ).rejects.toThrow();

      expect(copyRepositoryMock.updateStatus).not.toHaveBeenCalled();
    });
  });
});