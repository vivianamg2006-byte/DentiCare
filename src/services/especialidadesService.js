import { request } from "@/lib/http"

// Catálogo de especialidades (ej. Ortodoncia, Endodoncia). Solo lectura.

/**
 * Lista todas las especialidades.
 *
 * @returns {Promise<Array>} Especialidades registradas.
 */
export function listarEspecialidades() {
    return request("/especialidades")
}

/**
 * Obtiene una especialidad por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Especialidad encontrada.
 */
export function obtenerEspecialidad(id) {
    return request(`/especialidades/${id}`)
}
