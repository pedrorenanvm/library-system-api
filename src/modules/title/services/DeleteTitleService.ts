import { inject, injectable } from 'tsyringe';
import { ITitleRepository } from '../domain/repositories/ITitleRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import AppError from '@shared/errors/AppError';

@injectable()
class DeleteTitleService {
  constructor(
    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute(id: string): Promise<void> {
    const title = await this.titleRepository.findById(id);
    if (!title) {
      throw new AppError('Título não encontrado', 404);
    }

    await this.titleRepository.delete(id);
  }
}

export default DeleteTitleService;
