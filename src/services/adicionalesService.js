import { request } from "@/lib/http"

// CRUD de servicios adicionales (extras que se suman a una cita,
// ej. blanqueamiento express). Espejo del CRUD de servicios pero
// apuntando al recurso /servicios-adicionales.

/**
 * Lista todos los adicionales, activos e inactivos.
 *
 * @returns {Promise<Array>} Adicionales registrados.
 */
export function listarAdicionales() {
    return request("/servicios-adicionales")
}

/**
 * Lista solo los adicionales activos (para selección en la agenda).
 *
 * @returns {Promise<Array>} Adicionales activos.
 */
export function listarAdicionalesActivos() {
    return request("/servicios-adicionales/activos")
}

/**
 * Obtiene un adicional por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Adicional encontrado.
 */
export function obtenerAdicional(id) {
    return request(`/servicios-adicionales/${id}`)
}

/**
 * Crea un nuevo adicional.
 *
 * @param {object} payload - Datos del adicional (nombre, precio, etc.).
 * @returns {Promise<object>} Adicional creado.
 */
export function crearAdicional(payload) {
    return request("/servicios-adicionales", { method: "POST", body: payload })
}

/**
 * Actualiza un adicional existente.
 *
 * @param {number|string} id
 * @param {object} payload - Datos completos del adicional.
 * @returns {Promise<object>} Adicional actualizado.
 */
export function actualizarAdicional(id, payload) {
    return request(`/servicios-adicionales/${id}`, { method: "PUT", body: payload })
}

/**
 * Activa o desactiva un adicional con un PATCH puntual.
 *
 * @param {number|string} id
 * @param {boolean} activo
 * @returns {Promise<object>} Respuesta del API con el adicional actualizado.
 */
export function cambiarEstadoAdicional(id, activo) {
    return request(`/servicios-adicionales/${id}/estado`, { method: "PATCH", body: { activo } })
}
