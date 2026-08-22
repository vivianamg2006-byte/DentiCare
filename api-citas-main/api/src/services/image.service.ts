import fs from "fs/promises";
import path from "path";

const uploadDir = path.join(process.cwd(), "assets", "uploads");

export class ImageService {
    async uploadImage(file?: Express.Multer.File, previousFileName?: string) {
        if (!file) {
            throw new Error("Debe seleccionar una imagen");
        }
        if (previousFileName) {
            await this.deleteImageIfExists(previousFileName);
        }
        return file.filename;
    }
    async deleteImageIfExists(fileName: string) {
        const safeFileName = path.basename(fileName);
        const filePath = path.join(uploadDir, safeFileName);

        try {
            await fs.access(filePath);
            await fs.unlink(filePath);
        } catch {
            // Si no existe, no se lanza error.
        }
    }
    async listImages() {
        const files = await fs.readdir(uploadDir);
        return files;
    }
    getImagePath(fileName: string) {
        const safeFileName = path.basename(fileName);
        return path.join(uploadDir, safeFileName);
    }
}