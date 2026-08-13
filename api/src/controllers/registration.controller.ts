import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { registrationService } from "../services/registration.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

export class RegistrationController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const registrations = await registrationService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: registrations,
        });
    };

    obtenerPorUsuario = async (request: Request, response: Response, next: NextFunction) => {
        const userId = parseId(request.params.userId);

        const registrations = await registrationService.obtenerPorUsuario(userId);

        return response.status(StatusCodes.OK).json({
            success: true,
            data: registrations,
        });
    };

    obtenerPorEvento = async (request: Request, response: Response, next: NextFunction) => {
        const eventId = parseId(request.params.eventId);

        const registrations = await registrationService.obtenerPorEvento(eventId);

        return response.status(StatusCodes.OK).json({
            success: true,
            data: registrations,
        });
    };

    crear = async (request: Request, response: Response, next: NextFunction) => {
        const registration = await registrationService.crear(request.body);

        return sendSuccess(
            response,
            registration,
            "Inscripción creada correctamente",
            StatusCodes.CREATED
        );
    };

    actualizar = async (request: Request, response: Response, next: NextFunction) => {
        const eventId = parseId(request.params.eventId);
        const userId = parseId(request.params.userId);

        const registration = await registrationService.modificar(
            eventId,
            userId,
            request.body
        );

        return sendSuccess(
            response,
            registration,
            "Inscripción actualizada correctamente"
        );
    };

    eliminar = async (request: Request, response: Response, next: NextFunction) => {
        const eventId = parseId(request.params.eventId);
        const userId = parseId(request.params.userId);

        await registrationService.eliminar(eventId, userId);

        return response.status(StatusCodes.OK).json({
            success: true,
            message: "Inscripción eliminada correctamente",
        });
    };
}