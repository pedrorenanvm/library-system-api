import { inject, injectable } from 'tsyringe';
import { ITitleRepository } from '../domain/repositories/ITitleRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ITitlePaginate } from '../domain/models/ITitlePaginate';
import { IGetTitleFilters } from '../domain/models/IGetTitleFilters';

@injectable()
class ListTitlesService {
  constructor(
    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository
  ) {}

  public async execute(params: IGetTitleFilters): Promise<ITitlePaginate> {
    return await this.titleRepository.findAll(params);
  }
}

export default ListTitlesService;
