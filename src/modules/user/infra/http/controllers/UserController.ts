import CreateUserService from '@modules/user/services/CreateUserService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToPlain } from 'class-transformer';

export default class UserController {
    async create(req: Request, res: Response): Promise<Response>{
        const { name, email, registrationNumber, password, phone } = req.body;

        const createUser = container.resolve(CreateUserService);

        const user = await createUser.execute({
            name,
            email,
            registrationNumber,
            password,
            phone,
        });

        return res.status(201).json(instanceToPlain(user));
    }
}