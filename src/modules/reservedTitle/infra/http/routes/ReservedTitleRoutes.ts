import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import isTeacher from '@shared/infra/http/middlewares/isTeacher';
import ReservedTitleController from '../controllers/ReservedTitleController';

const reservedTitleRoutes = Router();
const reservedTitleController = new ReservedTitleController();

reservedTitleRoutes.post(
  '/',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.BODY]: Joi.object({
      titleId: Joi.string().uuid().required().messages({
        'string.guid': 'titleId deve ser um UUID válido.',
        'any.required': 'titleId é obrigatório.',
      }),
      disciplineName: Joi.string().min(2).max(255).required().messages({
        'any.required': 'Nome da disciplina é obrigatório.',
      }),
      startsAt: Joi.date().iso().required().messages({
        'any.required': 'Data de início é obrigatória.',
        'date.base': 'startsAt deve ser uma data válida.',
      }),
      endsAt: Joi.date().iso().greater(Joi.ref('startsAt')).required().messages({
        'any.required': 'Data de término é obrigatória.',
        'date.greater': 'A data de término deve ser posterior à data de início.',
      }),
      inLibraryOnly: Joi.boolean().default(true),
    }),
  }),
  (req, res) => reservedTitleController.create(req, res)
);

export default reservedTitleRoutes;