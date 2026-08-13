import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { validateRequest } from "../middlewares/validate-request.middleware";
import { loginUserSchema, registerUserSchema } from "../dtos/user.dto";
import { authenticateToken } from "../middlewares/auth.middleware";

export class UserRoutes {
    static get routes(): Router {
        const router = Router();
        const controller = new UserController();
        /**
         * @swagger
         * /users:
         *   get:
         *     summary: Obtener todos los usuarios
         *     tags: [Users]
         *     responses:
         *       200:
         *         description: Lista de usuarios
         */
        router.get("/", asyncHandler(controller.listar));
       
        /**
         * @swagger
         * /users/register:
         *   post:
         *     summary: Registrar un nuevo usuario
         *     description: Crea un usuario nuevo. La contraseña se guarda encriptada con bcrypt. Si no se envía roleId, se asigna el rol 2 por defecto.
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       description: Datos necesarios para registrar un usuario.
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *               - fullName
         *             properties:
         *               email:
         *                 type: string
         *                 example: "ana@email.com"
         *               password:
         *                 type: string
         *                 example: "123456"
         *               fullName:
         *                 type: string
         *                 example: "Ana Rodríguez"
         *               roleId:
         *                 type: integer
         *                 example: 2
         *                 description: Si no se envía, se asigna 2 por defecto.
         *           example:
         *             email: "ana@email.com"
         *             password: "123456"
         *             fullName: "Ana Rodríguez"
         *             roleId: 2
         *     responses:
         *       201:
         *         description: Usuario registrado correctamente
         *       400:
         *         description: Datos inválidos o correo ya registrado
         */
        router.post(
            "/register",
            validateRequest(registerUserSchema),
            asyncHandler(controller.registrar)
        );
        /**
  * @swagger
  * /users/login:
  *   post:
  *     summary: Iniciar sesión
  *     tags: [Usuarios]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             $ref: '#/components/schemas/LoginInput'
  *     responses:
  *       200:
  *         description: Inicio de sesión correcto
  *       400:
  *         description: Datos inválidos
  *       401:
  *         description: Credenciales incorrectas
  */
        router.post(
            "/login",
            validateRequest(loginUserSchema),
            asyncHandler(controller.login)
        );

        /**
         * @swagger
         * /users/perfil:
         *   get:
         *     summary: Obtener usuario autenticado
         *     description: Retorna la información del usuario logueado utilizando el token JWT enviado en el header Authorization.
         *     tags: [Usuarios]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Perfil del usuario autenticado
         *       401:
         *         description: Token no proporcionado, inválido o expirado
         */
        router.get(
            "/perfil",
            authenticateToken,
            asyncHandler(controller.perfil)
        );
         /**
         * @swagger
         * /users/{id}:
         *   get:
         *     summary: Obtener un usuario por ID
         *     tags: [Users]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *         example: 1
         *     responses:
         *       200:
         *         description: Usuario encontrado
         */
        router.get(
            "/:id",
            asyncHandler(controller.obtenerPorId)
        );
        return router;
    }
}