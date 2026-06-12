import { REPOSITORY_KEYS } from '@shared/container/keys';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import AppError from '@shared/errors/AppError';
import { inject, injectable } from 'tsyringe';

@injectable()
class DeleteUserService {
  constructor(
    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    await this.userRepository.delete(id);
  }
}

export default DeleteUserService;
