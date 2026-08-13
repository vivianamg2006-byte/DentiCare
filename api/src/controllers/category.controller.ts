import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { parseId } from "../utils/parse-id";
import { categoryService } from "../services/categoria.service";

export class CategoryController {
    listar = async (request: Request, response: Response, next: NextFunction) => {
        const categories = await categoryService.listar();

        return response.status(StatusCodes.OK).json({
            success: true,
            data: categories,
        });
    };

    obtenerPorId = async (request: Request, response: Response, next: NextFunction) => {
        const id = parseId(request.params.id);

        const category = await categoryService.obtenerPorId(id);

        if (!category) {
            return response.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: "La categoría no existe",
            });
        }

        return response.status(StatusCodes.OK).json({
            success: true,
            data: category,
        });
    };
}