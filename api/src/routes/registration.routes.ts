import { Router } from "express";
import { RegistrationController } from "../controllers/registration.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    createRegistrationSchema,
    updateRegistrationSchema,
} from "../dtos/registration.dto";

export class RegistrationRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new RegistrationController();
        /**
         * @swagger
         * /registrations:
         *   get:
         *     summary: Obtener todas las inscripciones
         *     tags: [Registrations]
         *     responses:
         *       200:
         *         description: Lista de inscripciones
         */
        router.get(
            "/",
            asyncHandler(controller.listar)
        );
        /**
         * @swagger
         * /registrations/user/{userId}:
         *   get:
         *     summary: Obtener inscripciones por usuario
         *     tags: [Registrations]
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: integer
         *         example: 1
         *     responses:
         *       200:
         *         description: Inscripciones del usuario
         */
        router.get(
            "/user/:userId",
            asyncHandler(controller.obtenerPorUsuario)
        );
        /**
         * @swagger
         * /registrations/event/{eventId}:
         *   get:
         *     summary: Obtener inscripciones por evento
         *     tags: [Registrations]
         *     parameters:
         *       - in: path
         *         name: eventId
         *         required: true
         *         schema:
         *           type: integer
         *         example: 1
         *     responses:
         *       200:
         *         description: Inscripciones del evento
         */
        router.get(
            "/event/:eventId",
            asyncHandler(controller.obtenerPorEvento)
        );
        /**
         * @swagger
         * /registrations:
         *   post:
         *     summary: Inscribir un usuario en un evento
         *     description: Crea una inscripción relacionando un usuario con un evento. Si no se envía statusId, se usa 1 por defecto.
         *     tags: [Registrations]
         *     requestBody:
         *       required: true
         *       description: Datos necesarios para registrar un usuario en un evento.
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - eventId
         *               - userId
         *             properties:
         *               eventId:
         *                 type: integer
         *                 example: 1
         *               userId:
         *                 type: integer
         *                 example: 2
         *               statusId:
         *                 type: integer
         *                 example: 1
         *                 description: Estado de inscripción. Si no se envía, se guarda como 1.
         *           example:
         *             eventId: 1
         *             userId: 2
         *             statusId: 1
         *     responses:
         *       201:
         *         description: Inscripción creada correctamente
         *       400:
         *         description: Datos inválidos
         */
        router.post(
            "/",
            validateRequest(createRegistrationSchema),
            asyncHandler(controller.crear)
        );
        /**
         * @swagger
         * /registrations/{eventId}/{userId}:
         *   put:
         *     summary: Actualizar el estado de una inscripción
         *     description: Actualiza el estado de una inscripción usando la llave compuesta eventId + userId.
         *     tags: [Registrations]
         *     parameters:
         *       - in: path
         *         name: eventId
         *         required: true
         *         description: ID del evento.
         *         schema:
         *           type: integer
         *         example: 1
         *       - in: path
         *         name: userId
         *         required: true
         *         description: ID del usuario inscrito.
         *         schema:
         *           type: integer
         *         example: 2
         *     requestBody:
         *       required: true
         *       description: Nuevo estado de la inscripción.
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - statusId
         *             properties:
         *               statusId:
         *                 type: integer
         *                 example: 2
         *           example:
         *             statusId: 2
         *     responses:
         *       200:
         *         description: Inscripción actualizada correctamente
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Inscripción no encontrada
         */
        router.put(
            "/:eventId/:userId",
            validateRequest(updateRegistrationSchema),
            asyncHandler(controller.actualizar)
        );
        /**
* @swagger
* /events/{id}:
*   delete:
         *     description: Elimina una inscripción usando la llave compuesta eventId + userId.
         *     tags: [Registrations]
         *     parameters:
         *       - in: path
         *         name: eventId
         *         required: true
         *         description: ID del evento.
         *         schema:
         *           type: integer
         *         example: 1
         *       - in: path
         *         name: userId
         *         required: true
         *         description: ID del usuario inscrito.
         *         schema:
         *           type: integer
         *         example: 2
         *     requestBody:
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - statusId
         *             properties:
         *               statusId:
         *                 type: integer
         *                 example: 2
         *           example:
         *             statusId: 2
         *     responses:
         *       200:
         *         description: Inscripción eliminada correctamente
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Inscripción no encontrada
*/
        router.delete(":eventId/:userId", asyncHandler(controller.eliminar));
        return router;
    }

}