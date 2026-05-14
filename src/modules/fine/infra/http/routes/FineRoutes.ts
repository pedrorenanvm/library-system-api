import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import isTeacher from '@shared/infra/http/middlewares/isTeacher';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import FineController from '../controller/FineController';

const fineRoutes = Router();
const fineController = new FineController();

fineRoutes.get(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.string().uuid().required() }),
  }),
  (req, res) => fineController.show(req, res)
);

fineRoutes.post(
  '/',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.BODY]: Joi.object({
      loanId: Joi.string().uuid().required(),
      amount: Joi.number().positive().required(),
      overdueDays: Joi.number().integer().min(1).required(),
    }),
  }),
  (req, res) => fineController.create(req, res)
);

// POST /multas/:id/pagamento
fineRoutes.post(
  '/:id/pagamento',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({ id: Joi.string().uuid().required() }),
  }),
  (req, res) => fineController.pay(req, res)
);

export default fineRoutes;
