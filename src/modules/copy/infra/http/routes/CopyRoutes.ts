import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import isTeacher from '@shared/infra/http/middlewares/isTeacher';
import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import { CopyStatus } from '@modules/copy/infra/typeorm/entities/Copy';
import CopyController from '../controller/CopyController';

const copyRoutes = Router();
const copyController = new CopyController();

/**
 * @route POST /copies
 * @description Cria um novo exemplar para um título
 * @access Private (autenticado + professor)
 * @body { barcode: string (max 100, required), titleId: string (uuid, required) }
 * @returns 201 - Exemplar criado
 * @returns 404 - Título não encontrado
 * @returns 409 - Código de barras já cadastrado
 */
copyRoutes.post(
  '/',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.BODY]: Joi.object({
      barcode: Joi.string().max(100).required().messages({
        'any.required': 'Código de barras é obrigatório.',
      }),
      titleId: Joi.string().uuid().required().messages({
        'any.required': 'Título é obrigatório.',
      }),
    }),
  }),
  (req, res) => copyController.create(req, res)
);

/**
 * @route GET /copies
 * @description Lista exemplares com paginação e filtros
 * @access Private (autenticado)
 * @query {
 *   page?: number (default: 1),
 *   limit?: number (default: 10),
 *   titleId?: string (uuid) - filtra por título,
 *   status?: CopyStatus,
 *   barcode?: string - busca parcial
 * }
 * @returns 200 - { data, total, per_page, current_page, last_page }
 */
copyRoutes.get(
  '/',
  isAuthenticate,
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      titleId: Joi.string().uuid().optional(),
      status: Joi.string()
        .valid(...Object.values(CopyStatus))
        .optional(),
      barcode: Joi.string().optional(),
    }),
  }),
  (req, res) => copyController.list(req, res)
);

/**
 * @route GET /copies/:id
 * @description Retorna um exemplar pelo id
 * @access Private (autenticado)
 * @returns 200 - Exemplar encontrado
 * @returns 404 - Exemplar não encontrado
 */
copyRoutes.get(
  '/:id',
  isAuthenticate,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => copyController.show(req, res)
);

/**
 * @route PUT /copies/:id
 * @description Atualiza barcode/título de um exemplar
 * @access Private (autenticado + professor)
 * @body { barcode: string, titleId: string (uuid) }
 * @returns 200 - Exemplar atualizado
 * @returns 404 - Exemplar ou título não encontrado
 * @returns 409 - Código de barras já cadastrado
 */
copyRoutes.put(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: Joi.object({
      barcode: Joi.string().max(100).required(),
      titleId: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => copyController.update(req, res)
);

/**
 * @route PATCH /copies/:id/status
 * @description Atualiza o status de um exemplar (disponível, emprestado, reservado, perdido, danificado)
 * @access Private (autenticado + professor)
 * @body { status: CopyStatus }
 * @returns 204 - Status atualizado
 * @returns 404 - Exemplar não encontrado
 */
copyRoutes.patch(
  '/:id/status',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: Joi.object({
      status: Joi.string()
        .valid(...Object.values(CopyStatus))
        .required(),
    }),
  }),
  (req, res) => copyController.updateStatus(req, res)
);

/**
 * @route DELETE /copies/:id
 * @description Remove (soft delete) um exemplar. Bloqueado se estiver emprestado.
 * @access Private (autenticado + professor)
 * @returns 204 - Exemplar removido
 * @returns 404 - Exemplar não encontrado
 * @returns 409 - Exemplar emprestado, não pode ser removido
 */
copyRoutes.delete(
  '/:id',
  isAuthenticate,
  isTeacher,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => copyController.delete(req, res)
);

export default copyRoutes;
