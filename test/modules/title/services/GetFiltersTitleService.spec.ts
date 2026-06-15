import 'reflect-metadata';
import GetFiltersTitleService from '@modules/title/services/GetFiltersTitleService';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ITitle } from '@modules/title/domain/models/ITitle';
import { ITitlePaginate } from '@modules/title/domain/models/ITitlePaginate';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';

const makeTitleRepositoryMock = (): jest.Mocked<ITitleRepository> => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  findAll: jest.fn(),
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

const makePaginateStub = (
  overrides: Partial<ITitlePaginate> = {}
): ITitlePaginate => ({
  per_page: 10,
  total: 1,
  current_page: 1,
  data: [makeTitleStub()],
  last_page: 1,
  ...overrides,
});

describe('GetFiltersTitleService', () => {
  let sut: GetFiltersTitleService;
  let titleRepositoryMock: jest.Mocked<ITitleRepository>;

  beforeEach(() => {
    titleRepositoryMock = makeTitleRepositoryMock();
    sut = new GetFiltersTitleService(titleRepositoryMock);
  });

  describe('Paginação', () => {
    it('deve retornar resultado paginado com dados corretos', async () => {
      const paginate = makePaginateStub();
      titleRepositoryMock.findAll.mockResolvedValue(paginate);

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.BOOK,
      });

      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(10);
      expect(result.data).toHaveLength(1);
    });

    it('deve repassar page e limit corretamente ao repositório', async () => {
      titleRepositoryMock.findAll.mockResolvedValue(makePaginateStub());

      await sut.execute({ page: 3, limit: 5, type: TitleType.BOOK });

      expect(titleRepositoryMock.findAll).toHaveBeenCalledWith({
        page: 3,
        limit: 5,
        type: TitleType.BOOK,
      });
    });

    it('deve retornar lista vazia quando não há títulos', async () => {
      titleRepositoryMock.findAll.mockResolvedValue(
        makePaginateStub({ data: [], total: 0 })
      );

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.BOOK,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('deve retornar last_page quando presente', async () => {
      titleRepositoryMock.findAll.mockResolvedValue(
        makePaginateStub({ total: 30, per_page: 10, last_page: 3 })
      );

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.BOOK,
      });

      expect(result.last_page).toBe(3);
    });
  });

  describe('Filtro por tipo', () => {
    it('deve filtrar por BOOK', async () => {
      const paginate = makePaginateStub({
        data: [makeTitleStub({ type: TitleType.BOOK })],
      });
      titleRepositoryMock.findAll.mockResolvedValue(paginate);

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.BOOK,
      });

      expect(titleRepositoryMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ type: TitleType.BOOK })
      );
      expect(result.data[0].type).toBe(TitleType.BOOK);
    });

    it('deve filtrar por PERIODICAL', async () => {
      const stub = makeTitleStub({ type: TitleType.PERIODICAL });
      titleRepositoryMock.findAll.mockResolvedValue(
        makePaginateStub({ data: [stub] })
      );

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.PERIODICAL,
      });

      expect(titleRepositoryMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ type: TitleType.PERIODICAL })
      );
      expect(result.data[0].type).toBe(TitleType.PERIODICAL);
    });

    it('deve filtrar por OTHER', async () => {
      const stub = makeTitleStub({ type: TitleType.OTHER });
      titleRepositoryMock.findAll.mockResolvedValue(
        makePaginateStub({ data: [stub] })
      );

      const result = await sut.execute({
        page: 1,
        limit: 10,
        type: TitleType.OTHER,
      });

      expect(titleRepositoryMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ type: TitleType.OTHER })
      );
      expect(result.data[0].type).toBe(TitleType.OTHER);
    });
  });

  describe('Chamada ao repositório', () => {
    it('deve chamar findAll exatamente uma vez', async () => {
      titleRepositoryMock.findAll.mockResolvedValue(makePaginateStub());

      await sut.execute({ page: 1, limit: 10, type: TitleType.BOOK });

      expect(titleRepositoryMock.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve propagar erro lançado pelo repositório', async () => {
      titleRepositoryMock.findAll.mockRejectedValue(
        new Error('Erro no banco de dados')
      );

      await expect(
        sut.execute({ page: 1, limit: 10, type: TitleType.BOOK })
      ).rejects.toThrow('Erro no banco de dados');
    });
  });
});
