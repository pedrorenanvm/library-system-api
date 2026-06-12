import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ICopyRepository } from '../domain/repositories/ICopyRepository';
import { CopyStatus } from '../infra/typeorm/entities/Copy';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
  status: CopyStatus;
}

@injectable()
class UpdateCopyStatusService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository
  ) {}

  public async execute({ id, status }: IRequest): Promise<void> {
    const copy = await this.copyRepository.findById(id);
    if (!copy) {
      throw new AppError('Exemplar não encontrado', 404);
    }

    await this.copyRepository.updateStatus(id, status);
  }
}

export default UpdateCopyStatusService;
