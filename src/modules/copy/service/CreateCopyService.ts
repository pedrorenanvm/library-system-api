import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ICopyRepository } from '../domain/repositories/ICopyRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ICopy } from '../domain/models/ICopy';
import { CopyStatus } from '../infra/typeorm/entities/Copy';
import AppError from '@shared/errors/AppError';

interface IRequest {
  barcode: string;
  titleId: string;
}

@injectable()
class CreateCopyService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository,

    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute({ barcode, titleId }: IRequest): Promise<ICopy> {
    const title = await this.titleRepository.findById(titleId);
    if (!title) {
      throw new AppError('Título não encontrado', 404);
    }

    const barcodeAlreadyExists =
      await this.copyRepository.findByBarcode(barcode);
    if (barcodeAlreadyExists) {
      throw new AppError(
        'Já existe um exemplar com este código de barras',
        409
      );
    }

    const copy = await this.copyRepository.create({
      barcode,
      titleId,
      status: CopyStatus.AVAILABLE,
    });

    return copy;
  }
}

export default CreateCopyService;
