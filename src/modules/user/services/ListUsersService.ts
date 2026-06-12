import { REPOSITORY_KEYS } from '@shared/container/keys';
import {
  IUserRepository,
  IUserPaginate,
  SearchParams,
} from '../domain/repositories/IUserRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class ListUsersService {
  constructor(
    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute(params: SearchParams): Promise<IUserPaginate> {
    return await this.userRepository.findAll(params);
  }
}

export default ListUsersService;
