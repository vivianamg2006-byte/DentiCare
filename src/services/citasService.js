import { request } from "@/lib/http"

// Gestión de citas: listados, agendas, creación/edición,
// cancelación (siempre con motivo) y cambio de estado.
// REGLA DE ORO: antes de crear o editar una cita hay que llamar
// a verificarDisponibilidad; si no, el API puede rechazar el
// movimiento por traslape con otro bloque.

/**
 * Lista todas las citas.
 *
 * @returns {Promise<Array>} Citas registradas.
 */
export function listarCitas() {
    return request("/citas")
}

/**
 * Lista las citas de un cliente puntual.
 *
 * @param {number|string} clienteId
 * @returns {Promise<Array>} Citas del cliente.
 */
export function listarCitasCliente(clienteId) {
    return request(`/citas/cliente/${clienteId}`)
}

/**
 * Lista las citas asignadas a un empleado.
 *
 * @param {number|string} empleadoId
 * @returns {Promise<Array>} Citas del empleado.
 */
export function listarCitasEmpleado(empleadoId) {
    return request(`/citas/empleado/${empleadoId}`)
}

/**
 * Agenda de un empleado en una fecha específica ("YYYY-MM-DD").
 *
 * @param {number|string} empleadoId
 * @param {string} fecha - Formato "YYYY-MM-DD".
 * @returns {Promise<object>} Bloques/citas del día para ese empleado.
 */
export function obtenerAgendaEmpleado(empleadoId, fecha) {
    return request(`/citas/agenda-empleado/${empleadoId}?fecha=${fecha}`)
}

/**
 * Agenda consolidada de TODA la clínica para un día.
 *
 * @param {string} fecha - Formato "YYYY-MM-DD".
 * @returns {Promise<object>} Citas del día agrupadas según responde el API.
 */
export function obtenerAgendaDiaria(fecha) {
    return request(`/citas/agenda-diaria?fecha=${fecha}`)
}

/**
 * Valida disponibilidad antes de crear o editar una cita.
 * DEBE llamarse siempre previo al POST/PUT: si `disponible` es false,
 * se muestra `motivo` al usuario y NO se envía la cita.
 *
 * @param {{empleadoId: number, servicioId: number, fecha: string, horaInicio: string, horaFin: string, citaIdExcluir?: number}} payload
 *   - citaIdExcluir solo va al editar, para que la propia cita no se cuente como traslape.
 * @returns {Promise<{disponible: boolean, motivo?: string}>} Resultado de la validación.
 */
export function consultarDisponibilidad(payload) {
    return request("/citas/disponibilidad", { method: "POST", body: payload })
}

/**
 * Crea una cita. El FrontEnd debe enviar duración y costos
 * ya calculados: el API los guarda tal cual.
 *
 * @param {object} payload - Cita completa (cliente, empleado, servicio, fecha "YYYY-MM-DD", horas "HH:mm"...).
 * @returns {Promise<object>} Cita creada.
 */
export function crearCita(payload) {
    return request("/citas", { method: "POST", body: payload })
}

/**
 * Actualiza una cita existente.
 * Recordatorio: validar disponibilidad primero (con citaIdExcluir = id).
 *
 * @param {number|string} id
 * @param {object} payload - Datos completos de la cita ya editada.
 * @returns {Promise<object>} Cita actualizada.
 */
export function actualizarCita(id, payload) {
    return request(`/citas/${id}`, { method: "PUT", body: payload })
}

/**
 * Cancela una cita. El motivo es obligatorio: si llega vacío
 * el API rechaza la petición.
 *
 * @param {number|string} id
 * @param {string} motivoCancelacion - Texto que explica la cancelación.
 * @returns {Promise<object>} Cita cancelada.
 */
export function cancelarCita(id, motivoCancelacion) {
    return request(`/citas/${id}/cancelar`, { method: "PATCH", body: { motivoCancelacion } })
}

/**
 * Cambia el estado de una cita (ej. a "Atendida").
 * El API valida que la transición sea permitida; si no lo es,
 * responde error con el motivo (llega como ApiError).
 *
 * @param {number|string} id
 * @param {number|string} estadoCitaId - Id del nuevo estado (catálogo /estados-cita).
 * @returns {Promise<object>} Cita con el estado actualizado.
 */
export function cambiarEstadoCita(id, estadoCitaId) {
    return request(`/citas/${id}/estado`, { method: "PATCH", body: { estadoCitaId } })
}

/**
 * Obtiene una cita por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Cita encontrada.
 */
export function obtenerCita(id) {
    return request(`/citas/${id}`)
}
