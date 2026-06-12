import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ICopyRepository } from '../domain/repositories/ICopyRepository';
import { CopyStatus } from '../infra/typeorm/entities/Copy';
import AppError from '@shared/errors/AppError';

@injectable()
class DeleteCopyService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository
  ) {}

  public async execute(id: string): Promise<void> {
    const copy = await this.copyRepository.findById(id);
    if (!copy) {
      throw new AppError('Exemplar não encontrado', 404);
    }

    if (copy.status === CopyStatus.LOANED) {
      throw new AppError('Não é possível remover um exemplar emprestado', 409);
    }

    await this.copyRepository.delete(id);
  }
}

export default DeleteCopyService;
