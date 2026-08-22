import { request } from "@/lib/http"

// Catálogo de días de la semana (1=Lunes … 7=Domingo).
// Lo usan horarios y restricciones para referenciar el día por id.

/**
 * Lista los días de la semana.
 *
 * @returns {Promise<Array>} Días con su id y nombre.
 */
export function listarDiasSemana() {
    return request("/dias-semana")
}

/**
 * Obtiene un día de la semana por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Día encontrado.
 */
export function obtenerDiaSemana(id) {
    return request(`/dias-semana/${id}`)
}
