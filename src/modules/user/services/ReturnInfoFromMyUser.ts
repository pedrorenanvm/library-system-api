import { REPOSITORY_KEYS } from '@shared/container/keys';
import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import AppError from '@shared/errors/AppError';

@injectable()
class ReturnInfoFromMyUser {
  constructor(
    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado');
    }
    return user;
  }
}

export default ReturnInfoFromMyUser;
