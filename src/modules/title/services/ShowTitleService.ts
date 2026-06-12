import { inject, injectable } from 'tsyringe';
import { ITitleRepository } from '../domain/repositories/ITitleRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ITitle } from '../domain/models/ITitle';
import AppError from '@shared/errors/AppError';

@injectable()
class ShowTitleService {
  constructor(
    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute(id: string): Promise<ITitle> {
    const title = await this.titleRepository.findById(id);
    if (!title) {
      throw new AppError('Título não encontrado', 404);
    }
    return title;
  }
}

export default ShowTitleService;
