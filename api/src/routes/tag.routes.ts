
import { Router } from "express";
import { TagController } from "../controllers/tag.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class TagRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new TagController();
/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Obtener todas las etiquetas
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Lista de etiquetas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 */
        router.get("/", asyncHandler(controller.listar));
/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Obtener una etiqueta por ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Etiqueta encontrada
 *       404:
 *         description: Etiqueta no encontrada
 */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}