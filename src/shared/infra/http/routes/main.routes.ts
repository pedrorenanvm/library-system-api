import { Router, Request, Response } from 'express';
import isAuthenticate from '../middlewares/isAutenticate';
import isTeacher from '../middlewares/isTeacher';
import authRoutes from '@modules/auth/infra/http/routes/AuthRoutes';
import userRoutes from '@modules/user/infra/http/routes/UserRoutes';
import titleRoutes from '@modules/title/infra/http/routes/TitleRoutes';
import loanRoutes from '@modules/loan/infra/http/routes/LounRoutes';
import fineRoutes from '@modules/fine/infra/http/routes/FineRoutes';

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
routes.use('/v1/api/titles', titleRoutes);
routes.use('/v1/api/loans', loanRoutes);
routes.use('/v1/api/fines', fineRoutes);

export default routes;
