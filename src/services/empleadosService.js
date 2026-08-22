import { request } from "@/lib/http"

// Gestión de empleados (odontólogos/asistentes) y consulta de su agenda.
// Los endpoints de agenda alimentan la pantalla de citas.

/**
 * Lista todos los empleados, activos e inactivos.
 *
 * @returns {Promise<Array>} Empleados registrados.
 */
export function listarEmpleados() {
    return request("/empleados")
}

/**
 * Lista empleados activos, opcionalmente filtrando por quienes
 * pueden atender un servicio específico (?servicioId=...).
 *
 * @param {number|string} [servicioId] - Si se pasa, devuelve solo empleados habilitados para ese servicio.
 * @returns {Promise<Array>} Empleados activos (filtrados o no).
 */
export function listarEmpleadosActivos(servicioId) {
    const query = servicioId ? `?servicioId=${servicioId}` : ""
    return request(`/empleados/activos${query}`)
}

/**
 * Obtiene un empleado por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Empleado encontrado.
 */
export function obtenerEmpleado(id) {
    return request(`/empleados/${id}`)
}

/**
 * Trae la agenda de un empleado para una fecha puntual ("YYYY-MM-DD").
 *
 * @param {number|string} id - Id del empleado.
 * @param {string} fecha - Fecha en formato "YYYY-MM-DD".
 * @returns {Promise<object>} Agenda del día (bloques/citas según responde el API).
 */
export function obtenerAgendaEmpleado(id, fecha) {
    return request(`/empleados/${id}/agenda?fecha=${fecha}`)
}

/**
 * Crea un nuevo empleado.
 *
 * @param {object} payload - Datos del empleado.
 * @returns {Promise<object>} Empleado creado.
 */
export function crearEmpleado(payload) {
    return request("/empleados", { method: "POST", body: payload })
}

/**
 * Actualiza un empleado existente.
 *
 * @param {number|string} id
 * @param {object} payload
 * @returns {Promise<object>} Empleado actualizado.
 */
export function actualizarEmpleado(id, payload) {
    return request(`/empleados/${id}`, { method: "PUT", body: payload })
}

/**
 * Activa o desactiva un empleado (baja lógica, no se borra).
 *
 * @param {number|string} id
 * @param {boolean} activo
 * @returns {Promise<object>} Respuesta del API con el empleado actualizado.
 */
export function cambiarEstadoEmpleado(id, activo) {
    return request(`/empleados/${id}/estado`, { method: "PATCH", body: { activo } })
}
