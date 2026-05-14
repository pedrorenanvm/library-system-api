import { REPOSITORY_KEYS } from "@shared/container/keys";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import AppError from "@shared/errors/AppError";
import { IUser } from "../domain/models/IUser";
import { inject, injectable } from 'tsyringe';
import { UserRole } from "../infra/typeorm/entities/User";
import { hash } from "bcryptjs";

interface IRequest {
    name: string;
    email: string;
    registrationNumber: string;
    password: string;
    phone?: string | null;

}

@injectable()
class CreateUserService {
    constructor(
        @inject(REPOSITORY_KEYS.UserRepository)
        private userRepository: IUserRepository
    ) {}

    public async execute({
        name,
        email,
        registrationNumber,
        password,
        phone,
    }: IRequest): Promise<IUser> {
        const emailAlreadyExists = await this.userRepository.findByEmail(email);
        if(emailAlreadyExists) {
            throw new AppError('Email já cadastrado', 409);
    }

    const registrationAlreadyExists = await this.userRepository.findByRegistrationNumber(registrationNumber);
    if(registrationAlreadyExists) {
        throw new AppError('Número de matrícula já cadastrado', 409);
    }

    const pepper = process.env.PEPPER ?? '';
    const hashedPassword = await hash(password + pepper, 12);

    const user = await this.userRepository.create({
        name,
        email,
        registrationNumber,
        password: hashedPassword,
        phone: phone ?? null, 
        role: UserRole.READER,
    });

    return user;
 }
}

export default CreateUserService;