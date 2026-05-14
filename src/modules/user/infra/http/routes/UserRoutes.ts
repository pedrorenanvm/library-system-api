import { celebrate, Joi, Segments } from "celebrate";
import { Router } from "express";
import UserController from "../controllers/UserController";

const userRoutes = Router();
const userController = new UserController();

userRoutes.post(
    '/',
    celebrate({
        [Segments.BODY]: Joi.object({
            name: Joi.string().min(3).max(255).required().messages({
                'string.min': 'Nome deve ter pelo menos 3 caracteres.',
                'any.required': 'Nome é obrigatório.',
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Informe um e-mail válido.',
                'any.required': 'E-mail é obrigatório.',
            }),
            registrationNumber: Joi.string().max(100).required().messages({
                'any.required': 'Mátricula é obrigatória.',
            }),
            password: Joi.string().min(8).required().messages({
                'string.min': 'Senha deve ter pelo menos 8 caracteres.',
                'any.required': 'Senha é obrigatória.',
            }),
            phone: Joi.string().max(20).optional().allow(null).messages({
                    'string.max': 'Telefone deve ter no máximo 20 caracteres.',
            }),
        }),
    }),
        (req, res) => userController.create(req, res)
);

export default userRoutes;