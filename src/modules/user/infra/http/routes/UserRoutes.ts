import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import UserController from '../controllers/UserController';
import isAuthenticate from '@shared/infra/http/middlewares/isAutenticate';
import { UserRole } from '@modules/user/infra/typeorm/entities/User';

const userRoutes = Router();
const userController = new UserController();

/**
 * @route POST /users
 * @description Cria um novo usuário
 * @access Public
 * @body {
 *   name: string (3-255 chars, required),
 *   email: string (formato válido, required),
 *   registrationNumber: string (max 100, required),
 *   password: string (min 8, required),
 *   phone?: string | null (max 20)
 * }
 * @returns 201 - Usuário criado
 * @returns 409 - Email ou matrícula já cadastrados
 */
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

/**
 * @route GET /users/info
 * @description Retorna os dados do usuário autenticado
 * @access Private (requer autenticação)
 * @returns 200 - Dados do usuário logado
 */
userRoutes.get('/info', isAuthenticate, userController.getMyDetails);

/**
 * @route PUT /users
 * @description Atualiza os dados do usuário autenticado (exceto senha)
 * @access Private (requer autenticação)
 * @body {
 *   name: string (3-255 chars, required),
 *   email: string (formato válido, required),
 *   registrationNumber: string (max 100, required),
 *   phone?: string | null (max 20)
 * }
 * @returns 200 - Usuário atualizado
 * @returns 404 - Usuário não encontrado
 * @returns 409 - Email ou matrícula já cadastrados por outro usuário
 */
userRoutes.put(
  '/',
  isAuthenticate,
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
      phone: Joi.string().max(20).optional().allow(null).messages({
        'string.max': 'Telefone deve ter no máximo 20 caracteres.',
      }),
    }),
  }),
  (req, res) => userController.update(req, res)
);

/**
 * @route GET /users
 * @description Lista usuários com paginação e filtros opcionais
 * @access Private (requer autenticação)
 * @query {
 *   page?: number (default: 1) - Página atual
 *   limit?: number (default: 10) - Itens por página
 *   name?: string - Filtra por nome (busca parcial, case-insensitive)
 *   role?: UserRole - Filtra por role (ADMIN | READER | etc.)
 * }
 * @returns 200 - {
 *   data: IUser[],
 *   total: number,
 *   per_page: number,
 *   current_page: number,
 *   last_page: number
 * }
 *
 * @example GET /users?page=2&limit=20&name=joao&role=READER
 */
userRoutes.get(
  '/',
  isAuthenticate,
  celebrate({
    [Segments.QUERY]: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      name: Joi.string().optional(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .optional(),
    }),
  }),
  (req, res) => userController.list(req, res)
);

/**
 * @route DELETE /users/:id
 * @description Remove (soft delete) um usuário pelo id
 * @access Private (requer autenticação)
 * @params {
 *   id: string (UUID, required)
 * }
 * @returns 204 - Usuário deletado com sucesso
 * @returns 404 - Usuário não encontrado
 */
userRoutes.delete(
  '/:id',
  isAuthenticate,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  (req, res) => userController.delete(req, res)
);

export default userRoutes;
