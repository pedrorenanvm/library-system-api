import 'reflect-metadata';
import CreateSubscriptionService from '@modules/subscription/services/CreateSubscriptionService';
import ListSubscriptionService from '@modules/subscription/services/ListSubscriptionService';
import UpdateSubscriptionService from '@modules/subscription/services/UpdateSubscriptionService';
import CheckExpiringSubscriptionsService from '@modules/subscription/services/CheckExpiringSubscriptionsService';
import { ISubscriptionRepository } from '@modules/subscription/domain/repositories/ISubscriptionRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ISubscription } from '@modules/subscription/domain/models/ISubscription';
import { ITitle } from '@modules/title/domain/models/ITitle';
import {
  SubscriptionStatus,
} from '@modules/subscription/infra/typeorm/entities/Subscription';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import AppError from '@shared/errors/AppError';



const makeSubscriptionRepositoryMock =
  (): jest.Mocked<ISubscriptionRepository> => ({
    findById: jest.fn(),
    findActiveByTitleId: jest.fn(),
    findAll: jest.fn(),
    findExpiring: jest.fn(),
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



const makePeriodicalStub = (overrides: Partial<ITitle> = {}): ITitle => ({
  id: 'title-uuid-001',
  name: 'Revista Científica',
  description: null,
  type: TitleType.PERIODICAL,
  maxLoanDays: 7,
  totalCopies: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeSubscriptionStub = (
  overrides: Partial<ISubscription> = {}
): ISubscription => ({
  id: 'sub-uuid-001',
  titleId: 'title-uuid-001',
  publisher: 'Editora Científica',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  status: SubscriptionStatus.ACTIVE,
  cost: 500,
  renewalFrequency: 'anual',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const validCreateRequest = {
  titleId: 'title-uuid-001',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
};


describe('CreateSubscriptionService', () => {
  let sut: CreateSubscriptionService;
  let subscriptionRepositoryMock: jest.Mocked<ISubscriptionRepository>;
  let titleRepositoryMock: jest.Mocked<ITitleRepository>;

  beforeEach(() => {
    subscriptionRepositoryMock = makeSubscriptionRepositoryMock();
    titleRepositoryMock = makeTitleRepositoryMock();
    sut = new CreateSubscriptionService(
      subscriptionRepositoryMock,
      titleRepositoryMock
    );
  });

  it('deve criar assinatura para título PERIODICAL', async () => {
    titleRepositoryMock.findById.mockResolvedValue(makePeriodicalStub());
    subscriptionRepositoryMock.findActiveByTitleId.mockResolvedValue(null);
    subscriptionRepositoryMock.create.mockResolvedValue(makeSubscriptionStub());

    const result = await sut.execute(validCreateRequest);

    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(subscriptionRepositoryMock.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar AppError 404 se título não encontrado', async () => {
    titleRepositoryMock.findById.mockResolvedValue(null);

    await expect(sut.execute(validCreateRequest)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('deve lançar AppError 422 se título não for PERIODICAL', async () => {
    titleRepositoryMock.findById.mockResolvedValue(
      makePeriodicalStub({ type: TitleType.BOOK })
    );

    await expect(sut.execute(validCreateRequest)).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it('deve lançar AppError 409 se já existe assinatura ativa', async () => {
    titleRepositoryMock.findById.mockResolvedValue(makePeriodicalStub());
    subscriptionRepositoryMock.findActiveByTitleId.mockResolvedValue(
      makeSubscriptionStub()
    );

    await expect(sut.execute(validCreateRequest)).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('deve lançar AppError 422 se startDate >= endDate', async () => {
    titleRepositoryMock.findById.mockResolvedValue(makePeriodicalStub());
    subscriptionRepositoryMock.findActiveByTitleId.mockResolvedValue(null);

    await expect(
      sut.execute({
        ...validCreateRequest,
        startDate: new Date('2026-12-31'),
        endDate: new Date('2026-01-01'),
      })
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});


describe('ListSubscriptionService', () => {
  let sut: ListSubscriptionService;
  let subscriptionRepositoryMock: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepositoryMock = makeSubscriptionRepositoryMock();
    sut = new ListSubscriptionService(subscriptionRepositoryMock);
  });

  it('deve retornar todas as assinaturas sem filtro', async () => {
    subscriptionRepositoryMock.findAll.mockResolvedValue([
      makeSubscriptionStub(),
    ]);

    const result = await sut.execute({});

    expect(result).toHaveLength(1);
    expect(subscriptionRepositoryMock.findAll).toHaveBeenCalledWith({
      status: undefined,
    });
  });

  it('deve filtrar por status ACTIVE', async () => {
    subscriptionRepositoryMock.findAll.mockResolvedValue([
      makeSubscriptionStub(),
    ]);

    await sut.execute({ status: SubscriptionStatus.ACTIVE });

    expect(subscriptionRepositoryMock.findAll).toHaveBeenCalledWith({
      status: SubscriptionStatus.ACTIVE,
    });
  });

  it('deve retornar array vazio quando não há assinaturas', async () => {
    subscriptionRepositoryMock.findAll.mockResolvedValue([]);

    const result = await sut.execute({});

    expect(result).toHaveLength(0);
  });
});


describe('UpdateSubscriptionService', () => {
  let sut: UpdateSubscriptionService;
  let subscriptionRepositoryMock: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepositoryMock = makeSubscriptionRepositoryMock();
    sut = new UpdateSubscriptionService(subscriptionRepositoryMock);
  });

  it('deve renovar assinatura com nova data de vencimento', async () => {
    const newEnd = new Date('2027-12-31');
    subscriptionRepositoryMock.findById.mockResolvedValue(makeSubscriptionStub());
    subscriptionRepositoryMock.update.mockImplementation(async (s) => s);

    const result = await sut.execute({
      id: 'sub-uuid-001',
      action: 'renew',
      newEndDate: newEnd,
    });

    expect(result.status).toBe(SubscriptionStatus.ACTIVE);
    expect(result.endDate).toEqual(newEnd);
  });

  it('deve cancelar assinatura', async () => {
    subscriptionRepositoryMock.findById.mockResolvedValue(makeSubscriptionStub());
    subscriptionRepositoryMock.update.mockImplementation(async (s) => s);

    const result = await sut.execute({ id: 'sub-uuid-001', action: 'cancel' });

    expect(result.status).toBe(SubscriptionStatus.CANCELLED);
  });

  it('deve lançar AppError 404 se assinatura não encontrada', async () => {
    subscriptionRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      sut.execute({ id: 'inexistente', action: 'cancel' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deve lançar AppError 422 ao tentar alterar assinatura cancelada', async () => {
    subscriptionRepositoryMock.findById.mockResolvedValue(
      makeSubscriptionStub({ status: SubscriptionStatus.CANCELLED })
    );

    await expect(
      sut.execute({ id: 'sub-uuid-001', action: 'renew', newEndDate: new Date('2027-12-31') })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it('deve lançar AppError 422 ao renovar sem newEndDate', async () => {
    subscriptionRepositoryMock.findById.mockResolvedValue(makeSubscriptionStub());

    await expect(
      sut.execute({ id: 'sub-uuid-001', action: 'renew' })
    ).rejects.toMatchObject({ statusCode: 422 });
  });
});


describe('CheckExpiringSubscriptionsService', () => {
  let sut: CheckExpiringSubscriptionsService;
  let subscriptionRepositoryMock: jest.Mocked<ISubscriptionRepository>;

  beforeEach(() => {
    subscriptionRepositoryMock = makeSubscriptionRepositoryMock();
    sut = new CheckExpiringSubscriptionsService(subscriptionRepositoryMock);
  });

  it('deve retornar assinaturas expirando nos próximos 30 dias (padrão)', async () => {
    subscriptionRepositoryMock.findExpiring.mockResolvedValue([
      makeSubscriptionStub(),
    ]);

    const result = await sut.execute({});

    expect(subscriptionRepositoryMock.findExpiring).toHaveBeenCalledWith(30);
    expect(result).toHaveLength(1);
  });

  it('deve usar o número de dias informado', async () => {
    subscriptionRepositoryMock.findExpiring.mockResolvedValue([]);

    await sut.execute({ days: 7 });

    expect(subscriptionRepositoryMock.findExpiring).toHaveBeenCalledWith(7);
  });

  it('deve retornar array vazio quando nenhuma assinatura expira em breve', async () => {
    subscriptionRepositoryMock.findExpiring.mockResolvedValue([]);

    const result = await sut.execute({ days: 30 });

    expect(result).toHaveLength(0);
  });
});