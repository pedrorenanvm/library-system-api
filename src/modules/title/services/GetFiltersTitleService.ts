import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { ITitleRepository } from '../domain/repositories/ITitleRepository';
import { IGetTitleFilters } from '../domain/models/IGetTitleFilters';
import { ITitlePaginate } from '../domain/models/ITitlePaginate';

@injectable()
class GetFiltersTitleService {
  constructor(
    @inject(REPOSITORY_KEYS.TitleRepository)
    private TitleRepository: ITitleRepository
  ) {}

  public async execute(data: IGetTitleFilters): Promise<ITitlePaginate> {
    const { limit, type, page } = data;
    return await this.TitleRepository.findAll({ limit, type, page });
  }
}

export default GetFiltersTitleService;
