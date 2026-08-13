import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { registrationStatusService } from "../services/registrationStatus.service";
import { parseId } from "../utils/parse-id";

export class RegistrationStatusController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const statuses = await registrationStatusService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: statuses,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const status = await registrationStatusService.obtenerPorId(id);

        if (!status) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El estado de inscripción no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: status,
        });
    };
}