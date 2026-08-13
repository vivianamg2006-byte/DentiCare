import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userRoleService } from "../services/userRole.service";
import { parseId } from "../utils/parse-id";

export class UserRoleController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const roles = await userRoleService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: roles,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const role = await userRoleService.obtenerPorId(id);

        if (!role) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El rol no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: role,
        });
    };
}