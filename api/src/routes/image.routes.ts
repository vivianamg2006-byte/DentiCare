import { Router } from "express";
import { ImageController } from "../controllers/image.controller";

export class ImageRoutes {
    static get routes() {
        const router = Router();
        const imageController = new ImageController();
/**
 * @swagger
 * upload:
 *   post:
 *     summary: Subir una imagen
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen jpg, jpeg, png o webp
 *               previousFileName:
 *                 type: string
 *                 example: "1718460000000-old.png"
 *                 description: Nombre de imagen anterior para eliminarla al reemplazar
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *       400:
 *         description: Error al subir la imagen
 */
        router.post("/upload", imageController.upload);
/**
 * @swagger
 * files:
 *   get:
 *     summary: Obtener la lista de imágenes guardadas
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: Lista de archivos de imagen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example:
 *                 - "react-event.png"
 *                 - "angular-event.png"
 */
        router.get("/files", imageController.getListFiles);
/**
 * @swagger
 * download/{name}:
 *   get:
 *     summary: Descargar una imagen por nombre
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: "react-event.png"
 *     responses:
 *       200:
 *         description: Archivo descargado correctamente
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Imagen no encontrada
 */
        router.get("/download/:name", imageController.download);
        return router;
    }
}