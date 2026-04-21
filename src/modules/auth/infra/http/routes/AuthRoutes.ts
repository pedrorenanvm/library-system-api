import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { celebrate, Joi, Segments } from 'celebrate';

const authController = new AuthController();
const authRoutes = Router();

authRoutes.post(
  '/login',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().required(),
      password: Joi.string().required(),
    },
  }),
  authController.login
);

export default authRoutes;
