import isAuthenticate from "@shared/infra/http/middlewares/isAutenticate";
import isTeacher from "@shared/infra/http/middlewares/isTeacher";
import { celebrate, Joi, Segments } from "celebrate";
import { Router } from "express";
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import TitleController from "../controllers/TitleController";


const titleRoutes = Router();
const titleController = new TitleController();

titleRoutes.post('/', isAuthenticate,isTeacher, 
    celebrate({
        [Segments.BODY]: Joi.object({
            name: Joi.string().min(2).max(255).required().messages({
                'string.min': 'Nome deve ter pelo enos 2 caracteres.',
                'any.required': 'Nome é obrigatório.',
            }),
            description: Joi.string().optional().allow(null, ''),
            type: Joi.string().valid(...Object.values(TitleType)).required().messages({
                'any.only': `Tipo deve ser um dos valores: ${Object.values(TitleType).join(',')}.`,
                'any.required': 'Tipo é obrigatório.',
            }),
            maxLoanDays: Joi.number().integer().min(1).required().messages({
                'number.min': 'O período máximo de empréstimo deve ser pelo menos 1 dia.',
                'any.required': 'O período máximo de empréstimo é obrigatório.',
            }),
            totalCopies: Joi.number().integer().min(1).required().messages({
                'number.min': 'O número de exemplares não pode ser negativo.',
                'any.required': 'O número de exemplares é obrigatório.',
            }),
        }),
    }),
    (req, res) => titleController.create(req, res)
);

export default titleRoutes;
