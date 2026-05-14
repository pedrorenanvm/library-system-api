import 'reflect-metadata';
import CreateTitleService from '@modules/title/services/CreateTitleService';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ITitle } from '@modules/title/domain/models/ITitle';
import { ICreateTitle } from '@modules/title/domain/models/ICreateTitle';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import AppError from '@shared/errors/AppError';


const makeTitleRepositoryMock = (): jest.Mocked<ITitleRepository> => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});


const makeTitleStub = (overrides: Partial<ITitle> = {}): ITitle => ({
  id: 'uuid-title-001',
  name: 'Dom Casmurro',
  description: 'Romance de Machado de Assis',
  type: TitleType.BOOK,
  maxLoanDays: 14,
  totalCopies: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});


describe('CreateTitleService', () => {
  let sut: CreateTitleService;
  let titleRepositoryMock: jest.Mocked<ITitleRepository>;

  beforeEach(() => {
    titleRepositoryMock = makeTitleRepositoryMock();
    sut = new CreateTitleService(titleRepositoryMock);
  });

  describe('Criação com sucesso', () => {
    it('deve criar um título do tipo BOOK', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(null);
      titleRepositoryMock.create.mockResolvedValue(makeTitleStub());

      const result = await sut.execute({
        name: 'Dom Casmurro',
        type: TitleType.BOOK,
        maxLoanDays: 14,
        totalCopies: 5,
      });

      expect(result.type).toBe(TitleType.BOOK);
      expect(titleRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('deve criar um título do tipo PERIODICAL', async () => {
      const stub = makeTitleStub({ type: TitleType.PERIODICAL });
      titleRepositoryMock.findByName.mockResolvedValue(null);
      titleRepositoryMock.create.mockResolvedValue(stub);

      const result = await sut.execute({
        name: 'Revista Veja',
        type: TitleType.PERIODICAL,
        maxLoanDays: 7,
        totalCopies: 3,
      });

      expect(result.type).toBe(TitleType.PERIODICAL);
    });

    it('deve criar um título do tipo OTHER', async () => {
      const stub = makeTitleStub({ type: TitleType.OTHER });
      titleRepositoryMock.findByName.mockResolvedValue(null);
      titleRepositoryMock.create.mockResolvedValue(stub);

      const result = await sut.execute({
        name: 'Atlas de Anatomia',
        type: TitleType.OTHER,
        maxLoanDays: 10,
        totalCopies: 2,
      });

      expect(result.type).toBe(TitleType.OTHER);
    });

    it('deve criar com descrição nula quando não informada', async () => {
      const stub = makeTitleStub({ description: null });
      titleRepositoryMock.findByName.mockResolvedValue(null);
      titleRepositoryMock.create.mockResolvedValue(stub);

      const result = await sut.execute({
        name: 'Dom Casmurro',
        type: TitleType.BOOK,
        maxLoanDays: 14,
        totalCopies: 5,
      });

      expect(result.description).toBeNull();
    });

    it('deve chamar create com os dados corretos', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(null);
      titleRepositoryMock.create.mockResolvedValue(makeTitleStub());

      await sut.execute({
        name: 'Dom Casmurro',
        description: 'Romance de Machado de Assis',
        type: TitleType.BOOK,
        maxLoanDays: 14,
        totalCopies: 5,
      });

      const calledWith = titleRepositoryMock.create.mock
        .calls[0][0] as ICreateTitle;
      expect(calledWith.name).toBe('Dom Casmurro');
      expect(calledWith.totalCopies).toBe(5);
      expect(calledWith.maxLoanDays).toBe(14);
    });
  });

  describe('Duplicidade de nome', () => {
    it('deve lançar AppError 409 se o nome já estiver cadastrado', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(makeTitleStub());

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: 14,
          totalCopies: 5,
        })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: 14,
          totalCopies: 5,
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('não deve chamar create se nome duplicado', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(makeTitleStub());

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: 14,
          totalCopies: 5,
        })
      ).rejects.toThrow();

      expect(titleRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('Validações de negócio', () => {
    it('deve lançar AppError 422 se maxLoanDays for zero', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(null);

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: 0,
          totalCopies: 5,
        })
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('deve lançar AppError 422 se maxLoanDays for negativo', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(null);

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: -1,
          totalCopies: 5,
        })
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('deve lançar AppError 422 se totalCopies for negativo', async () => {
      titleRepositoryMock.findByName.mockResolvedValue(null);

      await expect(
        sut.execute({
          name: 'Dom Casmurro',
          type: TitleType.BOOK,
          maxLoanDays: 14,
          totalCopies: -1,
        })
      ).rejects.toMatchObject({ statusCode: 422 });
    });
  });
});