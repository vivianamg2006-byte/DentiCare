import { Router } from "express";
import { ImageController } from "../controllers/image.controller";

export class ImageRoutes {
    static get routes() {
        const router = Router();
        const imageController = new ImageController();
/**
 * @swagger
 * components:
 *   schemas:
 *     ImageUploadResponse:
 *       type: object
 *       description: >
 *         El API únicamente devuelve y almacena (en las entidades que
 *         referencian una imagen, p. ej. Servicio) el nombre generado del
 *         archivo. Nunca se guarda la carpeta, ruta relativa/absoluta ni la
 *         URL completa; la ubicación física se resuelve del lado del
 *         servidor a partir del nombre mediante GET /images/download/{name}.
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         fileName:
 *           type: string
 *           description: Nombre del archivo generado. Es el único valor que debe guardarse/enviarse en otras entidades (por ejemplo servicio.imagen).
 *           example: "cita-1718460000000.png"
 */
/**
 * @swagger
 * upload:
 *   post:
 *     summary: Subir una imagen
 *     description: >
 *       Valida que el archivo sea jpg, jpeg, png o webp. La respuesta
 *       contiene únicamente el nombre del archivo (fileName); no se debe
 *       guardar ni enviar la carpeta, ruta ni URL completa en otras
 *       entidades, solo ese nombre.
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
 *                 description: Archivo de imagen jpg, jpeg, png o webp.
 *               previousFileName:
 *                 type: string
 *                 example: "cita-1718460000000-old.png"
 *                 description: >
 *                   Nombre (no ruta) de la imagen anterior, usado para
 *                   eliminarla del almacenamiento al reemplazarla.
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *       400:
 *         description: Error al subir la imagen (formato no permitido u otro error)
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
 *                 - "cita-1718460000000.png"
 *                 - "cita-1718460000001.png"
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
 *         example: "cita-1718460000000.png"
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