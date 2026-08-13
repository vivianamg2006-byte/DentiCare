import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";

import {
    createEventSchema,
    updateEventSchema,
} from "../dtos/event.dto";

export class EventRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new EventController();
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtener todos los eventos
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
        router.get("/", asyncHandler(controller.listar));
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtener un evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Evento encontrado
 *       404:
 *         description: Evento no encontrado
 */
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId)
        );
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crear un nuevo evento
 *     description: Crea un evento y permite asociarlo con una categoría, un organizador y varias etiquetas.
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       description: Datos necesarios para crear un evento.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - categoryId
 *               - organizerId
 *               - location
 *               - modality
 *               - totalCapacity
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Conferencia React"
 *               description:
 *                 type: string
 *                 example: "Evento sobre componentes, hooks y consumo de API."
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-20T18:00:00.000Z"
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *               organizerId:
 *                 type: integer
 *                 example: 1
 *               location:
 *                 type: string
 *                 example: "San José, Costa Rica"
 *               modality:
 *                 type: string
 *                 example: "Presencial"
 *               totalCapacity:
 *                 type: integer
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Si no se envía, se guarda como true.
 *               imageUrl:
 *                 type: string
 *                 example: "react-event.png"
 *               tagIds:
 *                 type: array
 *                 description: Lista de IDs de etiquetas existentes.
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *           example:
 *             title: "Conferencia React"
 *             description: "Evento sobre componentes, hooks y consumo de API."
 *             date: "2026-07-20T18:00:00.000Z"
 *             categoryId: 1
 *             organizerId: 1
 *             location: "San José, Costa Rica"
 *             modality: "Presencial"
 *             totalCapacity: 100
 *             isActive: true
 *             imageUrl: "react-event.png"
 *             tagIds: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Evento creado correctamente
 *       400:
 *         description: Datos inválidos
 */
        router.post(
            "/",
            validateRequest(createEventSchema),
            asyncHandler(controller.crear)
        );
/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Actualizar un evento existente
 *     description: Actualiza uno o varios datos de un evento. Si se envía tagIds, reemplaza las etiquetas actuales por las nuevas.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del evento que se desea actualizar.
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       description: Datos del evento a modificar. No es obligatorio enviar todos los campos.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Conferencia React Actualizada"
 *               description:
 *                 type: string
 *                 example: "Evento actualizado sobre React, Axios y consumo de API."
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-10T18:00:00.000Z"
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               organizerId:
 *                 type: integer
 *                 example: 1
 *               location:
 *                 type: string
 *                 example: "Alajuela, Costa Rica"
 *               modality:
 *                 type: string
 *                 example: "Virtual"
 *               totalCapacity:
 *                 type: integer
 *                 example: 150
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               imageUrl:
 *                 type: string
 *                 example: "react-updated.png"
 *               tagIds:
 *                 type: array
 *                 description: Reemplaza las etiquetas actuales del evento.
 *                 items:
 *                   type: integer
 *                 example: [2, 4]
 *           example:
 *             title: "Conferencia React Actualizada"
 *             description: "Evento actualizado sobre React, Axios y consumo de API."
 *             date: "2026-08-10T18:00:00.000Z"
 *             categoryId: 2
 *             organizerId: 1
 *             location: "Alajuela, Costa Rica"
 *             modality: "Virtual"
 *             totalCapacity: 150
 *             isActive: true
 *             imageUrl: "react-updated.png"
 *             tagIds: [2, 4]
 *     responses:
 *       200:
 *         description: Evento actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Evento no encontrado
 */
        router.put(
            "/:id",
            validateRequest(updateEventSchema),
            asyncHandler(controller.actualizar)
        );

        return router;
    }
}