import CreateUserService from '@modules/user/services/CreateUserService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { instanceToPlain } from 'class-transformer';
import ReturnInfoFromMyUser from '@modules/user/services/ReturnInfoFromMyUser';
import UpdateUserService from '@modules/user/services/UpdateUserService';
import ListUsersService from '@modules/user/services/ListUsersService';
import DeleteUserService from '@modules/user/services/DeleteUserService';

export default class UserController {
  async create(req: Request, res: Response): Promise<Response> {
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

  async getMyDetails(req: Request, res: Response): Promise<Response> {
    const id = req.user.id;

    const verifyInfo = container.resolve(ReturnInfoFromMyUser);

    const user = await verifyInfo.execute(id);

    return res.json(instanceToPlain(user));
  }

  async update(req: Request, res: Response): Promise<Response> {
    const id = req.user.id;
    const { name, email, registrationNumber, phone, role } = req.body;
    const updateUser = container.resolve(UpdateUserService);
    const user = await updateUser.execute({
      id,
      name,
      email,
      role,
      registrationNumber,
      phone,
    });
    return res.json(instanceToPlain(user));
  }
  async list(req: Request, res: Response): Promise<Response> {
    const { page = 1, limit = 10, name, role } = req.query;
    const listUsers = container.resolve(ListUsersService);
    const users = await listUsers.execute({
      page: Number(page),
      limit: Number(limit),
      name: name as string,
      role: role as any,
    });
    return res.json(instanceToPlain(users));
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const deleteUser = container.resolve(DeleteUserService);
    await deleteUser.execute(id);
    return res.status(204).send();
  }
}
