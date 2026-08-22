import { request } from "@/lib/http"

// Restricciones de horario (franjas bloqueadas: feriados, almuerzos, etc.).
// El API las descuenta al validar disponibilidad de citas.

/**
 * Lista todas las restricciones de horario.
 *
 * @returns {Promise<Array>} Restricciones registradas.
 */
export function listarRestricciones() {
    return request("/restricciones-horario")
}

/**
 * Obtiene una restricción por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Restricción encontrada.
 */
export function obtenerRestriccion(id) {
    return request(`/restricciones-horario/${id}`)
}
