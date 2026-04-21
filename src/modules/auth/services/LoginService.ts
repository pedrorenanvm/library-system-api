import { IUserRepository } from '@modules/user/domain/repositories/IUserRepository';
import { REPOSITORY_KEYS } from '@shared/container/keys';
import { compare } from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { LoginData } from '../domain/models/LoginData';
import AppError from '@shared/errors/AppError';
import { sign, SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import authConfig from '@config/auth';
type StringValue = `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;
@injectable()
class LoginService {
  constructor(
    @inject(REPOSITORY_KEYS.UserRepository)
    private userRepository: IUserRepository
  ) {}

  public async execute(data: LoginData, res: Response) {
    const { email, password } = data;
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email ou Senha incorretos', 401);
    }
    const pepper = process.env.PEPPER;
    const confirmPasswrord = await compare(password + pepper, user.password);
    if (!confirmPasswrord) {
      throw new AppError('Email ou Senha incorretos', 401);
    }
    const tokenOptions: SignOptions = {
      expiresIn: authConfig.jwt.expiresIn as StringValue,
      subject: String(user.id),
    };

    const token = sign({}, authConfig.jwt.secret, tokenOptions);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 120 * 60 * 1000,
    });

    return { message: 'Usuário Logado com sucesso' };
  }
}
export default LoginService;
