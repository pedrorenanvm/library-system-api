import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import isTeacher from '@shared/infra/http/middlewares/isTeacher';
import { SubscriptionStatus } from '@modules/subscription/infra/typeorm/entities/Subscription';
import SubscriptionController from '../controllers/SubscriptionController';

const subscriptionRoutes = Router();
const subscriptionController = new SubscriptionController();

subscriptionRoutes.get(
  '/expiring',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.QUERY]: Joi.object({
      days: Joi.number().integer().min(1).max(365).optional(),
    }),
  }),
  (req, res) => subscriptionController.expiring(req, res)
);

subscriptionRoutes.get(
  '/',
  isAuthenticate,
  celebrate({
    [Segments.QUERY]: Joi.object({
      status: Joi.string()
        .valid(...Object.values(SubscriptionStatus))
        .optional(),
    }),
  }),
  (req, res) => subscriptionController.list(req, res)
);

subscriptionRoutes.post(
  '/',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.BODY]: Joi.object({
      titleId: Joi.string().uuid().required().messages({
        'any.required': 'titleId é obrigatório.',
      }),
      publisher: Joi.string().max(255).optional().allow(null, ''),
      startDate: Joi.date().iso().required().messages({
        'any.required': 'Data de início é obrigatória.',
      }),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
        'any.required': 'Data de vencimento é obrigatória.',
        'date.greater': 'O vencimento deve ser posterior ao início.',
      }),
      cost: Joi.number().min(0).optional().allow(null),
      renewalFrequency: Joi.string().max(100).optional().allow(null, ''),
    }),
  }),
  (req, res) => subscriptionController.create(req, res)
);

subscriptionRoutes.put(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: Joi.object({
      action: Joi.string().valid('renew', 'cancel').required().messages({
        'any.only': 'Ação deve ser "renew" ou "cancel".',
        'any.required': 'Ação é obrigatória.',
      }),
      newEndDate: Joi.date().iso().when('action', {
        is: 'renew',
        then: Joi.required().messages({
          'any.required': 'Nova data de vencimento é obrigatória para renovação.',
        }),
        otherwise: Joi.optional(),
      }),
    }),
  }),
  (req, res) => subscriptionController.update(req, res)
);

export default subscriptionRoutes;