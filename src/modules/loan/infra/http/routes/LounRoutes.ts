import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import LoanController from '../controllers/LoanController';

const loanRoutes = Router();
const loanController = new LoanController();

loanRoutes.post(
  '/',
  isAuthenticate,
  celebrate({
    [Segments.BODY]: Joi.object({
      userId: Joi.string().uuid().required().messages({
        'string.guid': 'userId deve ser um UUID válido.',
        'any.required': 'userId é obrigatório.',
      }),
      copyId: Joi.string().uuid().required().messages({
        'string.guid': 'copyId deve ser um UUID válido.',
        'any.required': 'copyId é obrigatório.',
      }),
    }),
  }),
  (req, res) => loanController.create(req, res)
);

export default loanRoutes;