import LoginService from '@modules/auth/services/LoginService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';

export default class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const login = container.resolve(LoginService);
    const operation = await login.execute(
      { email: email as string, password: password as string },
      res
    );
    return res.json(operation);
  }
}
