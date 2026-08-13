import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { parseId } from "../utils/parse-id";
import { organizerService } from "../services/organizer.service";

export class OrganizerController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const organizers = await organizerService.listar()

        return response.status(StatusCodes.OK).json({
            success: true,
            data: organizers,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const organizer = await organizerService.obtenerPorId(id);

        if (!organizer) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El organizador no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: organizer,
        });
    };
}