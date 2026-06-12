import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { ILoanRepository } from '@modules/loan/domain/repositories/ILoanRepository';
import { ICopyRepository } from '@modules/copy/domain/repositories/ICopyRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { ILoan } from '@modules/loan/domain/models/ILoan';
import { LoanStatus } from '@modules/loan/infra/typeorm/entities/Loan';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import AppError from '@shared/errors/AppError';
import { IReservedTitleRepository } from '@modules/reservedTitle/domain/repositories/IReservedTitleRepository';

interface IRequest {
  userId: string;
  copyId: string;
}

@injectable()
class CreateLoanService {
  constructor(
    @inject(REPOSITORY_KEYS.LoanRepository)
    private loanRepository: ILoanRepository,

    @inject(REPOSITORY_KEYS.CopyRepository)
    private copyRepository: ICopyRepository,

    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository,

    @inject(REPOSITORY_KEYS.ReservedTitleRepository)
    private reservedTitleRepository: IReservedTitleRepository
  ) {}

  public async execute({ userId, copyId }: IRequest): Promise<ILoan> {

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Leitor não encontrado.', 404);
    }
    if (!user.isActive) {
      throw new AppError(
        'Leitor inativo não pode realizar empréstimos.',
        403
      );
    }

    const copy = await this.copyRepository.findById(copyId);
    if (!copy) {
      throw new AppError('Exemplar não encontrado.', 404);
    }
    if (copy.status !== CopyStatus.AVAILABLE) {
      throw new AppError(
        'Exemplar não está disponível para empréstimo.',
        409
      );
    }
    if (!copy.title) {
      throw new AppError(
        'Não foi possível carregar os dados do título.',
        500
      );
    }

    const activeReservation =
      await this.reservedTitleRepository.findActiveByTitleId(
        copy.titleId,
        new Date()
      );
    if (activeReservation?.inLibraryOnly) {
      throw new AppError(
        `Este título está reservado para consulta local na disciplina "${activeReservation.disciplineName}". Empréstimos externos não são permitidos neste período.`,
        403
      );
    }

    const loanedAt = new Date();
    const dueDate = new Date(loanedAt);
    dueDate.setDate(dueDate.getDate() + copy.title.maxLoanDays);

    
    const loan = await this.loanRepository.create({
      userId,
      copyId,
      loanedAt,
      dueDate,
      status: LoanStatus.ACTIVE,
    });

    
    await this.copyRepository.updateStatus(copyId, CopyStatus.LOANED);

    return loan;
  }
}

export default CreateLoanService;