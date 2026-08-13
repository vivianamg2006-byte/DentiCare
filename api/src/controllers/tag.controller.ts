import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { tagService } from "../services/tag.service";
import { parseId } from "../utils/parse-id";

export class TagController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const tags = await tagService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: tags,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const tag = await tagService.obtenerPorId(id);

        if (!tag) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "La etiqueta no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: tag,
        });
    };
}