import { inject, injectable } from 'tsyringe';
import { TitleType } from '../infra/typeorm/entities/Title';
import { ITitleRepository } from '../domain/repositories/ITitleRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ITitle } from '../domain/models/ITitle';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
  name: string;
  description?: string | null;
  type: TitleType;
  maxLoanDays: number;
  totalCopies: number;
}

@injectable()
class UpdateTitleService {
  constructor(
    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute({
    id,
    name,
    description,
    type,
    maxLoanDays,
    totalCopies,
  }: IRequest): Promise<ITitle> {
    const title = await this.titleRepository.findById(id);
    if (!title) {
      throw new AppError('Título não encontrado', 404);
    }

    if (name !== title.name) {
      const titleAlreadyExists = await this.titleRepository.findByName(name);
      if (titleAlreadyExists) {
        throw new AppError('Já existe um título cadastrado com este nome', 409);
      }
    }

    if (maxLoanDays <= 0) {
      throw new AppError(
        'O número máximo de dias para empréstimo deve ser maior que zero',
        422
      );
    }

    if (totalCopies < 0) {
      throw new AppError('O número de exemplares não pode ser negativo.', 422);
    }

    title.name = name;
    title.description = description ?? null;
    title.type = type;
    title.maxLoanDays = maxLoanDays;
    title.totalCopies = totalCopies;

    const updatedTitle = await this.titleRepository.update(title);
    return updatedTitle;
  }
}

export default UpdateTitleService;
