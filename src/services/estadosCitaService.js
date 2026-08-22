import { request } from "@/lib/http"

// Catálogo de estados de una cita (ej. Programada, Atendida, Cancelada).
// Solo lectura: los estados los define el backend.

/**
 * Lista todos los estados de cita.
 *
 * @returns {Promise<Array>} Estados disponibles.
 */
export function listarEstadosCita() {
    return request("/estados-cita")
}

/**
 * Obtiene un estado de cita por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Estado encontrado.
 */
export function obtenerEstadoCita(id) {
    return request(`/estados-cita/${id}`)
}
