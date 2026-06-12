import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ICopyRepository } from '../domain/repositories/ICopyRepository';
import { ICopy } from '../domain/models/ICopy';
import AppError from '@shared/errors/AppError';

@injectable()
class ShowCopyService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository
  ) {}

  public async execute(id: string): Promise<ICopy> {
    const copy = await this.copyRepository.findById(id);
    if (!copy) {
      throw new AppError('Exemplar não encontrado', 404);
    }
    return copy;
  }
}

export default ShowCopyService;
