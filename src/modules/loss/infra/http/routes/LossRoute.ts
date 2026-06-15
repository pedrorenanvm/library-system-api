import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';

import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';

import { LossStatus } from '../../typeorm/entities/Loss';
import LossController from '../controller/LossController';

const lossRoutes = Router();

const controller = new LossController();

lossRoutes.use(isAuthenticate);

lossRoutes.get('/', (req, res) => controller.index(req, res));

lossRoutes.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => controller.show(req, res)
);

lossRoutes.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object({
      copyId: Joi.string().uuid().required(),
      userId: Joi.string().uuid().required(),
      notes: Joi.string().allow('', null),
      replacementFee: Joi.number().min(0),
    }),
  }),
  (req, res) => controller.create(req, res)
);

lossRoutes.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: Joi.object({
      notes: Joi.string().allow('', null),
      replacementFee: Joi.number().min(0),
      status: Joi.string().valid(...Object.values(LossStatus)),
    }),
  }),
  (req, res) => controller.update(req, res)
);

lossRoutes.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => controller.delete(req, res)
);

export default lossRoutes;
