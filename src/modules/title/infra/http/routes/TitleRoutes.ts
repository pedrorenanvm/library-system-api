// src/modules/title/infra/http/routes/title.routes.ts
import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import isTeacher from '@shared/infra/http/middlewares/isTeacher';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import { TitleType } from '@modules/title/infra/typeorm/entities/Title';
import TitleController from '../controllers/TitleController';

const titleRoutes = Router();
const titleController = new TitleController();

const titleBodySchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres.',
    'any.required': 'Nome é obrigatório.',
  }),
  description: Joi.string().optional().allow(null, ''),
  type: Joi.string()
    .valid(...Object.values(TitleType))
    .required()
    .messages({
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
});

/**
 * @route POST /titles
 * @description Cria um novo título
 * @access Private (autenticado + professor)
 * @body { name, description?, type, maxLoanDays, totalCopies }
 * @returns 201 - Título criado
 * @returns 409 - Nome já cadastrado
 * @returns 422 - Valores inválidos para maxLoanDays/totalCopies
 */
titleRoutes.post(
  '/',
  isAuthenticate,
  isTeacher,
  celebrate({ [Segments.BODY]: titleBodySchema }),
  (req, res) => titleController.create(req, res)
);

/**
 * @route GET /titles
 * @description Lista títulos com paginação e filtros
 * @access Private (autenticado)
 * @query {
 *   page?: number (default: 1),
 *   limit?: number (default: 10),
 *   name?: string - busca parcial,
 *   type?: TitleType
 * }
 * @returns 200 - { data, total, per_page, current_page, last_page }
 */
titleRoutes.get(
  '/',
  isAuthenticate,
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      type: Joi.string()
        .valid(...Object.values(TitleType))
        .optional(),
    }),
  }),
  (req, res) => titleController.list(req, res)
);

/**
 * @route GET /titles/:id
 * @description Retorna um título pelo id
 * @access Private (autenticado)
 * @returns 200 - Título encontrado
 * @returns 404 - Título não encontrado
 */
titleRoutes.get(
  '/:id',
  isAuthenticate,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => titleController.show(req, res)
);

/**
 * @route PUT /titles/:id
 * @description Atualiza um título existente
 * @access Private (autenticado + professor)
 * @body { name, description?, type, maxLoanDays, totalCopies }
 * @returns 200 - Título atualizado
 * @returns 404 - Título não encontrado
 * @returns 409 - Nome já cadastrado por outro título
 * @returns 422 - Valores inválidos
 */
titleRoutes.put(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: titleBodySchema,
  }),
  (req, res) => titleController.update(req, res)
);

/**
 * @route DELETE /titles/:id
 * @description Remove (soft delete) um título
 * @access Private (autenticado + professor)
 * @returns 204 - Título removido
 * @returns 404 - Título não encontrado
 */
titleRoutes.delete(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => titleController.delete(req, res)
);

export default titleRoutes;
