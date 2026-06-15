import 'reflect-metadata';
import CreateReservedTitleService from '@modules/reservedTitle/services/CreateReservedTitleService';
import { IReservedTitleRepository } from '@modules/reservedTitle/domain/repositories/IReservedTitleRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { IReservedTitle } from '@modules/reservedTitle/domain/models/IReservedTitle';
import { IUser } from '@modules/user/domain/models/IUser';
import { ITitle } from '@modules/title/domain/models/ITitle';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import AppError from '@shared/errors/AppError';


const makeReservedTitleRepositoryMock =
  (): jest.Mocked<IReservedTitleRepository> => ({
    findById: jest.fn(),
    findActiveByTitleId: jest.fn(),
    findOverlapping: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

const makeTitleRepositoryMock = (): jest.Mocked<ITitleRepository> => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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


const makeTeacherStub = (overrides: Partial<IUser> = {}): IUser => ({
  id: 'teacher-uuid-001',
  name: 'Prof. Ana',
  email: 'ana@escola.com',
  registrationNumber: 'PROF001',
  password: 'hashed',
  phone: null,
  role: UserRole.TEACHER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeTitleStub = (overrides: Partial<ITitle> = {}): ITitle => ({
  id: 'title-uuid-001',
  name: 'Algoritmos',
  description: null,
  type: TitleType.BOOK,
  maxLoanDays: 14,
  totalCopies: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeReservationStub = (
  overrides: Partial<IReservedTitle> = {}
): IReservedTitle => ({
  id: 'reservation-uuid-001',
  titleId: 'title-uuid-001',
  teacherId: 'teacher-uuid-001',
  disciplineName: 'Estruturas de Dados',
  startsAt: new Date('2026-06-01'),
  endsAt: new Date('2026-07-01'),
  inLibraryOnly: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const validRequest = {
  teacherId: 'teacher-uuid-001',
  titleId: 'title-uuid-001',
  disciplineName: 'Estruturas de Dados',
  startsAt: new Date('2026-06-01'),
  endsAt: new Date('2026-07-01'),
};


describe('CreateReservedTitleService', () => {
  let sut: CreateReservedTitleService;
  let reservedTitleRepositoryMock: jest.Mocked<IReservedTitleRepository>;
  let titleRepositoryMock: jest.Mocked<ITitleRepository>;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    reservedTitleRepositoryMock = makeReservedTitleRepositoryMock();
    titleRepositoryMock = makeTitleRepositoryMock();
    userRepositoryMock = makeUserRepositoryMock();
    sut = new CreateReservedTitleService(
      reservedTitleRepositoryMock,
      titleRepositoryMock,
      userRepositoryMock
    );
  });

  describe('Criação com sucesso', () => {
    it('deve criar reserva com inLibraryOnly = true por padrão', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeTeacherStub());
      titleRepositoryMock.findById.mockResolvedValue(makeTitleStub());
      reservedTitleRepositoryMock.findOverlapping.mockResolvedValue(null);
      reservedTitleRepositoryMock.create.mockResolvedValue(
        makeReservationStub()
      );

      const result = await sut.execute(validRequest);

      expect(result.inLibraryOnly).toBe(true);
      expect(reservedTitleRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('deve associar o título à disciplina corretamente', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeTeacherStub());
      titleRepositoryMock.findById.mockResolvedValue(makeTitleStub());
      reservedTitleRepositoryMock.findOverlapping.mockResolvedValue(null);
      reservedTitleRepositoryMock.create.mockResolvedValue(
        makeReservationStub()
      );

      const result = await sut.execute(validRequest);

      expect(result.titleId).toBe('title-uuid-001');
      expect(result.disciplineName).toBe('Estruturas de Dados');
    });
  });

  describe('Validação do professor', () => {
    it('deve lançar AppError 404 se professor não encontrado', async () => {
      userRepositoryMock.findById.mockResolvedValue(null);

      await expect(sut.execute(validRequest)).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(reservedTitleRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('deve lançar AppError 403 se usuário não for professor', async () => {
      userRepositoryMock.findById.mockResolvedValue(
        makeTeacherStub({ role: UserRole.READER })
      );

      await expect(sut.execute(validRequest)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('Validação do título', () => {
    it('deve lançar AppError 404 se título não encontrado', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeTeacherStub());
      titleRepositoryMock.findById.mockResolvedValue(null);

      await expect(sut.execute(validRequest)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('Validação do período', () => {
    it('deve lançar AppError 422 se startsAt >= endsAt', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeTeacherStub());
      titleRepositoryMock.findById.mockResolvedValue(makeTitleStub());

      await expect(
        sut.execute({
          ...validRequest,
          startsAt: new Date('2026-07-01'),
          endsAt: new Date('2026-06-01'),
        })
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('deve lançar AppError 409 se já existe reserva no período', async () => {
      userRepositoryMock.findById.mockResolvedValue(makeTeacherStub());
      titleRepositoryMock.findById.mockResolvedValue(makeTitleStub());
      reservedTitleRepositoryMock.findOverlapping.mockResolvedValue(
        makeReservationStub()
      );

      await expect(sut.execute(validRequest)).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(reservedTitleRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});