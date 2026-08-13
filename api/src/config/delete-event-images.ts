import fs from "node:fs/promises";
import path from "node:path";

async function deleteEventImages(): Promise<void> {
    const uploadsFolder = path.resolve(
        process.cwd(),
        "assets",
        "uploads"
    );

    console.log("Carpeta revisada:", uploadsFolder);

    try {
        const files = await fs.readdir(uploadsFolder, {
            withFileTypes: true,
        });

        const eventFiles = files.filter(
            (file) =>
                file.isFile() &&
                file.name.toLowerCase().startsWith("evento")
        );

        if (eventFiles.length === 0) {
            console.log(
                "No se encontraron archivos que comiencen con 'evento'."
            );
            return;
        }

        for (const file of eventFiles) {
            const filePath = path.join(uploadsFolder, file.name);

            await fs.unlink(filePath);

            console.log(`Archivo eliminado: ${filePath}`);
        }

        console.log(
            `Total de imágenes eliminadas: ${eventFiles.length}`
        );
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            console.error(
                `La carpeta no existe: ${uploadsFolder}`
            );
            return;
        }

        console.error(
            "Ocurrió un error al eliminar las imágenes:",
            error
        );

        process.exitCode = 1;
    }
}

deleteEventImages();