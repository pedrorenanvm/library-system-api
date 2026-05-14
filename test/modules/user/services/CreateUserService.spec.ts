import 'reflect-metadata';
import CreateUserService from '@modules/user/services/CreateUserService';
import {
  IUserRepository,
  IUserPaginate,
  SearchParams,
} from '@modules/user/domain/repositories/IUserRepository';
import { IUser } from '@modules/user/domain/models/IUser';
import { ICreateUser } from '@modules/user/domain/models/ICreateUser';
import AppError from '@shared/errors/AppError';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';


const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByRegistrationNumber: jest.fn(),
  verifyRole: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeUserStub = (overrides: Partial<IUser> = {}): IUser => ({
  id: 'uuid-123',
  name: 'LF de Mel',
  email: 'lf@gmail.com',
  registrationNumber: '2024001',
  password: 'lf123',
  phone: null,
  role: UserRole.READER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});


describe('CreateUserService', () => {
  let sut: CreateUserService;
  let userRepositoryMock: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepositoryMock = makeUserRepositoryMock();
    sut = new CreateUserService(userRepositoryMock);
    process.env.PEPPER = 'test-pepper';
  });

  describe('Criação com sucesso', () => {
    it('deve criar um leitor com role READER por padrão', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByRegistrationNumber.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue(makeUserStub());

      const result = await sut.execute({
        name: 'LF de Mel',
        email: 'lf@gmail.com',
        registrationNumber: '2024001',
        password: 'lf123',
      });

      expect(result.role).toBe(UserRole.READER);
      expect(userRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('deve chamar o repositório com a senha hasheada (não em plain text)', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByRegistrationNumber.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue(makeUserStub());

      await sut.execute({
        name: 'LF de Mel',
        email: 'lf@gmail.com',
        registrationNumber: '2024001',
        password: 'lf123',
      });

      const calledWith = userRepositoryMock.create.mock.calls[0][0] as ICreateUser;
      expect(calledWith.password).not.toBe('lf123');
      expect(calledWith.password.startsWith('$2')).toBe(true); // bcrypt hash
    });

    it('deve criar com phone opcional nulo quando não informado', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByRegistrationNumber.mockResolvedValue(null);
      userRepositoryMock.create.mockResolvedValue(makeUserStub({ phone: null }));

      const result = await sut.execute({
        name: 'LF de Mel',
        email: 'lf@gmail.com',
        registrationNumber: '2024001',
        password: 'lf123',
      });

      expect(result.phone).toBeNull();
    });
  });

  describe('Duplicidade de cadastro', () => {
    it('deve lançar AppError 409 se o email já estiver cadastrado', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(makeUserStub());

      await expect(
        sut.execute({
          name: 'Outro Nome',
          email: 'lf@gmail.com',
          registrationNumber: '9999999',
          password: 'lf123',
        })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        sut.execute({
          name: 'Outro Nome',
          email: 'lf@gmail.com',
          registrationNumber: '9999999',
          password: 'lf123',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('deve lançar AppError 409 se a matrícula já estiver cadastrada', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(null);
      userRepositoryMock.findByRegistrationNumber.mockResolvedValue(makeUserStub());

      await expect(
        sut.execute({
          name: 'Outro Nome',
          email: 'outro@gmail.com',
          registrationNumber: '2024001',
          password: 'senha1234',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('não deve chamar create se email duplicado', async () => {
      userRepositoryMock.findByEmail.mockResolvedValue(makeUserStub());

      await expect(
        sut.execute({
          name: 'LF de Mel',
          email: 'lf@gmail.com',
          registrationNumber: '2024001',
          password: 'lf123',
        })
      ).rejects.toThrow();

      expect(userRepositoryMock.create).not.toHaveBeenCalled();
    });
  });
});