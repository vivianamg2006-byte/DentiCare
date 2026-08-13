import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { eventService } from "../services/event.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class EventController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const events = await eventService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: events,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const event = await eventService.obtenerPorId(id);

        if (!event) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El evento no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: event,
        });
    };

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const event = await eventService.crear(request.body);

        return sendSuccess(
            response,
            event,
            "Evento creado correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const event = await eventService.modificar(id, request.body);

        return sendSuccess(
            response,
            event,
            "Evento actualizado correctamente"
        );
    };
}