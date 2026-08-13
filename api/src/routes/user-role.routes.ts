import { Router } from "express";
import { UserRoleController } from "../controllers/user-role.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class UserRoleRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UserRoleController();
/**
 * @swagger
 * /user-roles:
 *   get:
 *     summary: Obtener roles de usuario
 *     tags: [UserRoles]
 *     responses:
 *       200:
 *         description: Lista de roles
 */
        router.get("/", asyncHandler(controller.listar));
/**
 * @swagger
 * /user-roles/{id}:
 *   get:
 *     summary: Obtener un rol por ID
 *     tags: [UserRoles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Rol encontrado
 */
        router.get("/:id", asyncHandler(controller.obtenerPorId));

        return router;
    }
}