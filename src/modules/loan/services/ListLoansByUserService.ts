import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import AppError from '@shared/errors/AppError';

interface IRequest {
  userId: string;
}

@injectable()
class ListLoansByUserService {
  constructor(
    @inject(REPOSITORY_KEYS.LoanRepository)
    private loanRepository: ILoanRepository,

    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute({ userId }: IRequest): Promise<ILoan[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Leitor não encontrado.', 404);
    }

    return this.loanRepository.findByUserId(userId);
  }
}

export default ListLoansByUserService;