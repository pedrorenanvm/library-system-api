import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import {
  ICopyRepository,
  ICopyPaginate,
  SearchCopyParams,
} from '../domain/repositories/ICopyRepository';

@injectable()
class ListCopiesService {
  constructor(
    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository
  ) {}

  public async execute(params: SearchCopyParams): Promise<ICopyPaginate> {
    return await this.copyRepository.findAll(params);
  }
}

export default ListCopiesService;
