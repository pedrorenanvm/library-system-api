import 'reflect-metadata';
import CreateLoanService from '@modules/loan/services/CreateLoanService';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import {
  IUserRepository,
  SearchParams,
  IUserPaginate,
} from '@modules/user/domain/repositories/IUserRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { ICopy } from '@modules/copy/domain/models/ICopy';
import { IUser } from '@modules/user/domain/models/IUser';
import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
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

const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  findAll: jest.fn(),
  verifyRole: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});


const makeUserStub = (overrides: Partial<IUser> = {}): IUser => ({
  id: 'user-uuid-001',
  name: 'João Leitor',
  email: 'joao@email.com',
  registrationNumber: '2024001',
  password: 'hashed',
  phone: null,
  role: UserRole.READER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeCopyStub = (overrides: Partial<ICopy> = {}): ICopy => ({
  id: 'copy-uuid-001',
  barcode: 'BAR001',
  status: CopyStatus.AVAILABLE,
  titleId: 'title-uuid-001',
  title: {
    id: 'title-uuid-001',
    name: 'Dom Casmurro',
    description: null,
    type: TitleType.BOOK,
    maxLoanDays: 14,
    totalCopies: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeLoanStub = (overrides: Partial<ILoan> = {}): ILoan => ({
  id: 'loan-uuid-001',
  copyId: 'copy-uuid-001',
  userId: 'user-uuid-001',
  loanedAt: new Date(),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  returnedAt: null,
  status: LoanStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});



describe('CreateLoanService', () => {
  let sut: CreateLoanService;
  let loanRepositoryMock: jest.Mocked<ILoanRepository>;
  let copyRepositoryMock: jest.Mocked<ICopyRepository>;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    loanRepositoryMock = makeLoanRepositoryMock();
    copyRepositoryMock = makeCopyRepositoryMock();
    userRepositoryMock = makeUserRepositoryMock();
    sut = new CreateLoanService(
      loanRepositoryMock,
      copyRepositoryMock,
      userRepositoryMock
    );
  });

  describe('Empréstimo criado com sucesso', () => {
    it('deve criar empréstimo com status ACTIVE', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(makeCopyStub());
      loanRepositoryMock.create.mockResolvedValue(makeLoanStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const result = await sut.execute({
        userId: 'user-uuid-001',
        copyId: 'copy-uuid-001',
      });

      expect(result.status).toBe(LoanStatus.ACTIVE);
      expect(loanRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('deve calcular dueDate corretamente com base em maxLoanDays', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(makeCopyStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      const expectedDueDate = new Date();
      expectedDueDate.setDate(expectedDueDate.getDate() + 14);

      loanRepositoryMock.create.mockImplementation(async (data) => ({
        ...makeLoanStub(),
        dueDate: data.dueDate,
      }));

      const result = await sut.execute({
        userId: 'user-uuid-001',
        copyId: 'copy-uuid-001',
      });

      const diffMs = result.dueDate.getTime() - new Date().getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);
    });

    it('deve atualizar status do exemplar para LOANED após o empréstimo', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(makeCopyStub());
      loanRepositoryMock.create.mockResolvedValue(makeLoanStub());
      copyRepositoryMock.updateStatus.mockResolvedValue();

      await sut.execute({
        userId: 'user-uuid-001',
        copyId: 'copy-uuid-001',
      });

      expect(copyRepositoryMock.updateStatus).toHaveBeenCalledWith(
        'copy-uuid-001',
        CopyStatus.LOANED
      );
    });
  });

  describe('Validação do leitor', () => {
    it('deve lançar AppError 404 se leitor não encontrado', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        sut.execute({ userId: 'inexistente', copyId: 'copy-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(loanRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve lançar AppError 403 se leitor estiver inativo', async () => {
      userRepositoryMock.findById.mockResolvedValue(
        makeUserStub({ isActive: false })
      );

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'copy-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(loanRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('Validação do exemplar', () => {
    it('deve lançar AppError 404 se exemplar não encontrado', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'inexistente' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve lançar AppError 409 se exemplar estiver emprestado (LOANED)', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(
        makeCopyStub({ status: CopyStatus.LOANED })
      );

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'copy-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve lançar AppError 409 se exemplar estiver perdido (LOST)', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(
        makeCopyStub({ status: CopyStatus.LOST })
      );

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'copy-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve lançar AppError 409 se exemplar estiver reservado (RESERVED)', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(
        makeCopyStub({ status: CopyStatus.RESERVED })
      );

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'copy-uuid-001' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('não deve atualizar status do exemplar se a criação do loan falhar', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      copyRepositoryMock.findById.mockResolvedValue(makeCopyStub());
      loanRepositoryMock.create.mockRejectedValue(new Error('DB error'));

      await expect(
        sut.execute({ userId: 'user-uuid-001', copyId: 'copy-uuid-001' })
      ).rejects.toThrow();

      expect(copyRepositoryMock.updateStatus).not.toHaveBeenCalled();
    });
  });
});