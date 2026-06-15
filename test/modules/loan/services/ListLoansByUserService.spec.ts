import 'reflect-metadata';
import ListLoansByUserService from '@modules/loan/services/ListLoansByUserService';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { IUser } from '@modules/user/domain/models/IUser';
import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';


const makeLoanRepositoryMock = (): jest.Mocked<ILoanRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
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
  copy: {
    id: 'copy-uuid-001',
    barcode: 'BAR001',
    status: CopyStatus.LOANED,
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
  },
  fine: null,
  ...overrides,
});


describe('ListLoansByUserService', () => {
  let sut: ListLoansByUserService;
  let loanRepositoryMock: jest.Mocked<ILoanRepository>;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    loanRepositoryMock = makeLoanRepositoryMock();
    userRepositoryMock = makeUserRepositoryMock();
    sut = new ListLoansByUserService(loanRepositoryMock, userRepositoryMock);
  });

  describe('Listagem com sucesso', () => {
    it('deve retornar os empréstimos do leitor com copy e título', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      loanRepositoryMock.findByUserId.mockResolvedValue([makeLoanStub()]);

      const result = await sut.execute({ userId: 'user-uuid-001' });

      expect(result).toHaveLength(1);
      expect(result[0].copy?.title?.name).toBe('Dom Casmurro');
      expect(loanRepositoryMock.findByUserId).toHaveBeenCalledWith(
        'user-uuid-001'
      );
    });

    it('deve retornar array vazio se o leitor não tiver empréstimos', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      loanRepositoryMock.findByUserId.mockResolvedValue([]);

      const result = await sut.execute({ userId: 'user-uuid-001' });

      expect(result).toHaveLength(0);
    });

    it('deve incluir dados da multa quando o empréstimo tiver fine', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeUserStub());
      loanRepositoryMock.findByUserId.mockResolvedValue([
        makeLoanStub({
          status: LoanStatus.RETURNED,
          fine: {
            id: 'fine-uuid-001',
            loanId: 'loan-uuid-001',
            amount: 5,
            overdueDays: 5,
            status: 'pending' as never,
            paidAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        }),
      ]);

      const result = await sut.execute({ userId: 'user-uuid-001' });

      expect(result[0].fine?.amount).toBe(5);
    });
  });

  describe('Validações de negócio', () => {
    it('deve lançar AppError 404 se leitor não encontrado', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(
        sut.execute({ userId: 'inexistente' })
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(loanRepositoryMock.findByUserId).not.toHaveBeenCalled();
    });
  });
});