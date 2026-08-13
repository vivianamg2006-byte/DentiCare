import { Router } from "express";

import { asyncHandler } from "../middlewares/async-handler.middleware";
import { CategoryController } from "../controllers/category.controller";

export class CategoryRoutes {
    static get routes(): Router {
        const router = Router()
        const controller = new CategoryController()
        //Rutas
        //locahost:3000/categoria/

 /**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
        router.get('/', asyncHandler(controller.listar))
/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
        router.get('/:id', asyncHandler(controller.obtenerPorId))
        return router
    }
}
