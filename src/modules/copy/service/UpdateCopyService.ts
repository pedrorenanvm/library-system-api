import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ICopyRepository } from '../domain/repositories/ICopyRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { ICopy } from '../domain/models/ICopy';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
  barcode: string;
  titleId: string;
}

@injectable()
class UpdateCopyService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository,

    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute({ id, barcode, titleId }: IRequest): Promise<ICopy> {
    const copy = await this.copyRepository.findById(id);
    if (!copy) {
      throw new AppError('Exemplar não encontrado', 404);
    }

    if (titleId !== copy.titleId) {
      const title = await this.titleRepository.findById(titleId);
      if (!title) {
        throw new AppError('Título não encontrado', 404);
      }
    }

    if (barcode !== copy.barcode) {
      const barcodeAlreadyExists =
        await this.copyRepository.findByBarcode(barcode);
      if (barcodeAlreadyExists) {
        throw new AppError(
          'Já existe um exemplar com este código de barras',
          409
        );
      }
    }

    copy.barcode = barcode;
    copy.titleId = titleId;

    const updatedCopy = await this.copyRepository.update(copy);
    return updatedCopy;
  }
}

export default UpdateCopyService;
