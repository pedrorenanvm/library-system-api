import { Router, Request, Response } from 'express';
import isAuthenticate from '../middlewares/isAutenticate';
import isTeacher from '../middlewares/isTeacher';
import authRoutes from '@modules/auth/infra/http/routes/AuthRoutes';
import userRoutes from '@modules/user/infra/http/routes/UserRoutes';

const routes = Router();

routes.get(
  '/',
  isAuthenticate,
  isTeacher,
  async (req: Request, res: Response) => {
    res.json({ message: 'Ola Mundo' });
  }
);

routes.use('/v1/api/auth', authRoutes);
routes.use('/v1/api/readers', userRoutes);
export default routes;
