import { REPOSITORY_KEYS } from '@shared/container/keys';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import AppError from '@shared/errors/AppError';
import { IUser } from '../domain/models/IUser';
import { inject, injectable } from 'tsyringe';
import { UserRole } from '../infra/typeorm/entities/User';

interface IRequest {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registrationNumber: string;
  phone?: string | null;
}

@injectable()
class UpdateUserService {
  constructor(
    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute({
    id,
    name,
    email,
    role,
    registrationNumber,
    phone,
  }: IRequest): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (email !== user.email) {
      const emailAlreadyExists = await this.userRepository.findByEmail(email);
      if (emailAlreadyExists) {
        throw new AppError('Email já cadastrado', 409);
      }
    }

    if (registrationNumber !== user.registrationNumber) {
      const registrationAlreadyExists =
        await this.userRepository.findByRegistrationNumber(registrationNumber);
      if (registrationAlreadyExists) {
        throw new AppError('Número de matrícula já cadastrado', 409);
      }
    }

    if (role !== UserRole.READER && role !== UserRole.TEACHER) {
      throw new AppError('Role inválido', 400);
    }

    user.name = name;
    user.email = email;
    user.role = role;
    user.registrationNumber = registrationNumber;
    user.phone = phone ?? null;

    const updatedUser = await this.userRepository.update(user);
    return updatedUser;
  }
}

export default UpdateUserService;
