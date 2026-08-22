import { request } from "@/lib/http"

// Servicio de autenticación y gestión de usuarios.
// Ojo: login, registro y consulta de perfil son los únicos flujos que
// tocan /usuarios sin (o con) Bearer de forma especial:
// - login y registro van SIN token (aún no hay sesión).
// - /usuarios/perfil ES el único endpoint que exige Bearer obligatoriamente.

/**
 * Inicia sesión contra el API.
 *
 * @param {string} correo - Correo del usuario.
 * @param {string} password - Contraseña en texto plano (viaja por HTTPS).
 * @returns {Promise<{token: string, usuario: object>}|object} Payload con el token para guardar en localStorage.
 */
export function loginUsuario(correo, password) {
    return request("/usuarios/login", { method: "POST", authenticated: false, body: { correo, password } })
}

/**
 * Trae el perfil del usuario autenticado.
 * Es el ÚNICO endpoint que exige el header Bearer obligatoriamente;
 * `request` ya lo agrega porque authenticated viene true por defecto.
 *
 * @returns {Promise<object>} Datos del usuario en sesión.
 */
export function obtenerPerfil() {
    return request("/usuarios/perfil")
}

/**
 * Registra un nuevo cliente (público, sin token).
 *
 * @param {object} payload - Datos del formulario de registro del cliente.
 * @returns {Promise<object>} Usuario creado según responde el API.
 */
export function registrarCliente(payload) {
    return request("/usuarios/registro", { method: "POST", authenticated: false, body: payload })
}

/**
 * Lista usuarios, opcionalmente filtrados por rol (?rol=...).
 *
 * @param {string} [rol] - Rol para filtrar (ej. "cliente", "empleado").
 * @returns {Promise<Array>} Lista de usuarios.
 */
export function listarUsuarios(rol) {
    // Se codifica el rol por si llega con espacios o acentos
    const query = rol ? `?rol=${encodeURIComponent(rol)}` : ""
    return request(`/usuarios${query}`)
}

/**
 * Obtiene un usuario puntual por su id.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Usuario encontrado (el API lanza 404 vía ApiError si no existe).
 */
export function obtenerUsuario(id) {
    return request(`/usuarios/${id}`)
}
