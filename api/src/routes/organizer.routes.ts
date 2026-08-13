import { Router } from "express";
import { OrganizerController } from "../controllers/organizar.controller";

export class OrganizerRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new OrganizerController();
/**
 * @swagger
 * /organizers:
 *   get:
 *     summary: Obtener todos los organizadores
 *     tags: [Organizers]
 *     responses:
 *       200:
 *         description: Lista de organizadores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organizer'
 */
        router.get("/", controller.listar);
/**
 * @swagger
 * /organizers/{id}:
 *   get:
 *     summary: Obtener un organizador por ID
 *     tags: [Organizers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Organizador encontrado
 *       404:
 *         description: Organizador no encontrado
 */
        router.get("/:id", controller.obtenerPorId);

        return router;
    }
}