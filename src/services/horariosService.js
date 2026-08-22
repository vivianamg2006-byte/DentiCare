import { request } from "@/lib/http"

// Horarios de atención de la clínica por día de la semana.
// Sirven para saber qué franjas se ofrecen al agendar una cita.

/**
 * Lista todos los horarios de atención configurados.
 *
 * @returns {Promise<Array>} Horarios (día, horaInicio "HH:mm", horaFin "HH:mm").
 */
export function listarHorariosAtencion() {
    return request("/horarios-atencion")
}

/**
 * Obtiene un horario de atención por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Horario encontrado.
 */
export function obtenerHorarioAtencion(id) {
    return request(`/horarios-atencion/${id}`)
}
