import { Router } from "express";
import { RegistrationStatusController } from "../controllers/registration-status.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class RegistrationStatusRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new RegistrationStatusController();
/**
 * @swagger
 * /registration-statuses:
 *   get:
 *     summary: Obtener estados de inscripción
 *     tags: [RegistrationStatuses]
 *     responses:
 *       200:
 *         description: Lista de estados
 */
        router.get("/", asyncHandler(controller.listar));
/**
 * @swagger
 * /registration-statuses/{id}:
 *   get:
 *     summary: Obtener un estado de inscripción por ID
 *     tags: [RegistrationStatuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estado encontrado
 */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}