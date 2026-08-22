import { request } from "@/lib/http"

// CRUD de servicios dentales (limpieza, empaste, etc.).
// Todos los endpoints requieren token; el PATCH de estado es para
// activar/desactivar sin reenviar todo el objeto.

/**
 * Lista todos los servicios (activos e inactivos).
 *
 * @returns {Promise<Array>} Servicios registrados.
 */
export function listarServicios() {
    return request("/servicios")
}

/**
 * Lista solo los servicios marcados como activos.
 * Es el que consumen las pantallas públicas / agendamiento.
 *
 * @returns {Promise<Array>} Servicios activos.
 */
export function listarServiciosActivos() {
    return request("/servicios/activos")
}

/**
 * Obtiene un servicio por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Servicio encontrado.
 */
export function obtenerServicio(id) {
    return request(`/servicios/${id}`)
}

/**
 * Crea un nuevo servicio.
 *
 * @param {object} payload - Datos del servicio (nombre, descripción, precio, duración...).
 * @returns {Promise<object>} Servicio creado.
 */
export function crearServicio(payload) {
    return request("/servicios", { method: "POST", body: payload })
}

/**
 * Actualiza un servicio existente (reemplazo completo).
 *
 * @param {number|string} id
 * @param {object} payload - Datos completos del servicio.
 * @returns {Promise<object>} Servicio actualizado.
 */
export function actualizarServicio(id, payload) {
    return request(`/servicios/${id}`, { method: "PUT", body: payload })
}

/**
 * Activa o desactiva un servicio sin enviar el resto de campos.
 *
 * @param {number|string} id
 * @param {boolean} activo - true para activar, false para desactivar.
 * @returns {Promise<object>} Respuesta del API con el servicio actualizado.
 */
export function cambiarEstadoServicio(id, activo) {
    return request(`/servicios/${id}/estado`, { method: "PATCH", body: { activo } })
}
