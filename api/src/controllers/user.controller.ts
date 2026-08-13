import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.service";
import { sendSuccess } from "../utils/http-response";
import { parseId } from "../utils/parse-id";

import { AuthRequest } from "../middlewares/auth.middleware";

export class UserController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const users = await userService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: users,
        });
    };

    obtenerPorId = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const id = parseId(request.params.id);

        const user = await userService.obtenerPorId(id);

        if (!user) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "El usuario no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: user,
        });
    };

    registrar = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        const user = await userService.registrar(request.body);

        return sendSuccess(
            response,
            user,
            "Usuario registrado correctamente",
            StatusCodes.CREATED
        );
    };

    login = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const result = await userService.login(request.body);

        return sendSuccess(
            response,
            result,
            "Inicio de sesión correcto"
        );
    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Credenciales incorrectas";

        if (
            message === "Correo o contraseña incorrectos" ||
            message === "El usuario se encuentra inactivo"
        ) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Credenciales incorrectas",
            });
        }

        next(error);
    }
};

    perfil = async (request: AuthRequest, response: Response, next: NextFunction) => {
        const usuarioId = request.user?.id;

        if (!usuarioId) {
            return response.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Usuario no autenticado: " + usuarioId,
            });
        }
        
        const usuario = await userService.perfil(usuarioId);
        if (!usuario) { 
            return response 
            .status(StatusCodes.NOT_FOUND) 
            .json({ success: false, message: "El usuario autenticado no existe: " + usuarioId }) 
        }
        return sendSuccess(
            response,
            usuario,
            "Perfil obtenido correctamente"
        );
    };
}