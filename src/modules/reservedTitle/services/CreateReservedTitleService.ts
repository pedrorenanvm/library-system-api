import { inject, injectable } from 'tsyringe';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { IReservedTitleRepository } from '@modules/reservedTitle/domain/repositories/IReservedTitleRepository';
import { ITitleRepository } from '@modules/title/domain/repositories/ITitleRepository';
import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { IReservedTitle } from '@modules/reservedTitle/domain/models/IReservedTitle';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';
import AppError from '@shared/errors/AppError';

interface IRequest {
  teacherId: string;
  titleId: string;
  disciplineName: string;
  startsAt: Date;
  endsAt: Date;
  inLibraryOnly?: boolean;
}

@injectable()
class CreateReservedTitleService {
  constructor(
    @inject(REPOSITORY_KEYS.ReservedTitleRepository)
    private reservedTitleRepository: IReservedTitleRepository,

    @inject(REPOSITORY_KEYS.TitleRepository)
    private titleRepository: ITitleRepository,

    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute({
    teacherId,
    titleId,
    disciplineName,
    startsAt,
    endsAt,
    inLibraryOnly = true,
  }: IRequest): Promise<IReservedTitle> {
    const teacher = await this.userRepository.findById(teacherId);
    if (!teacher) {
      throw new AppError('Professor não encontrado.', 404);
    }
    if (teacher.role !== UserRole.TEACHER) {
      throw new AppError(
        'Apenas professores podem criar reservas de consulta local.',
        403
      );
    }

    const title = await this.titleRepository.findById(titleId);
    if (!title) {
      throw new AppError('Título não encontrado.', 404);
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (start >= end) {
      throw new AppError(
        'A data de início deve ser anterior à data de término.',
        422
      );
    }

    const overlapping = await this.reservedTitleRepository.findOverlapping(
      titleId,
      start,
      end
    );
    if (overlapping) {
      throw new AppError(
        `Já existe uma reserva para este título no período de ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}.`,
        409
      );
    }

    const reservation = await this.reservedTitleRepository.create({
      titleId,
      teacherId,
      disciplineName,
      startsAt: start,
      endsAt: end,
      inLibraryOnly,
    });

    return reservation;
  }
}

export default CreateReservedTitleService;