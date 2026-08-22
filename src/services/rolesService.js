import { request } from "@/lib/http"

// Servicio de roles de usuario (solo lectura: el API no expone CRUD aquí).

/**
 * Lista todos los roles disponibles.
 *
 * @returns {Promise<Array>} Roles registrados en el sistema.
 */
export function listarRoles() {
    return request("/roles")
}

/**
 * Obtiene un rol por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Rol encontrado.
 */
export function obtenerRol(id) {
    return request(`/roles/${id}`)
}
