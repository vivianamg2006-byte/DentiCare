import { request } from "@/lib/http"

// Manejo de imágenes (fotos de perfil, etc.): subida multipart y
// construcción de la URL pública para mostrarlas en la UI.

// Base pública donde el backend expone los archivos subidos
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL

/**
 * Sube una imagen al API como multipart/form-data.
 * Si se indica previousFileName el API reemplaza el archivo anterior
 * (se usa al actualizar una foto que ya existía).
 *
 * @param {File|Blob} archivo - Archivo seleccionado por el usuario.
 * @param {string|null} [previousFileName] - Nombre del archivo a reemplazar, si aplica.
 * @returns {Promise<{fileName: string}>} Nombre con el que quedó guardada la imagen.
 */
export function subirImagen(archivo, previousFileName = null) {
    // El campo DEBE llamarse "image": así lo espera el endpoint
    const formData = new FormData()
    formData.append("image", archivo)
    if (previousFileName) {
        formData.append("previousFileName", previousFileName)
    }
    return request("/images/upload", { method: "POST", formData: true, body: formData })
}

/**
 * Arma la URL pública de una imagen a partir de su fileName.
 *
 * @param {string|null} fileName - Nombre del archivo guardado.
 * @returns {string|null} URL completa lista para <img src>, o null si no hay fileName.
 */
export function urlImagen(fileName) {
    if (!fileName) return null
    return `${IMAGE_URL}/${fileName}`
}
