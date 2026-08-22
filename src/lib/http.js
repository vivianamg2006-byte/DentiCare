// Capa HTTP central del frontend: todos los servicios del dominio
// (authService, citasService, etc.) consumen el API a través de `request`.
// Se encarga de armar headers, adjuntar el token Bearer y desenvolver
// las respuestas { success, message, data } dejando solo `data`.
const API_URL = import.meta.env.VITE_API_URL
const TOKEN_KEY = "token"

/**
 * Error estándar para cualquier fallo del API.
 * Permite a la UI capturar un único tipo de error con mensaje
 * ya listo para mostrar al usuario.
 *
 * @param {string} message - Mensaje legible (normalmente el `message` que devuelve el backend).
 * @param {number|null} status - Código HTTP de la respuesta, si existe.
 */
export class ApiError extends Error {
    constructor(message, status = null) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

/**
 * Lee el token JWT guardado en localStorage (clave "token").
 *
 * @returns {string|null} Token guardado, o null si no hay sesión activa.
 */
export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY)
}

/**
 * Guarda o elimina el token en localStorage.
 * Si `token` es falsy se elimina la clave: así se implementa el logout.
 *
 * @param {string|null} token - Token JWT nuevo, o null/vacío para cerrar sesión.
 */
export function setStoredToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        // Sin token => limpiamos la clave para dejar la app sin sesión
        localStorage.removeItem(TOKEN_KEY)
    }
}

async function parsePayload(response) {
    // El API normalmente responde JSON, pero ante cuerpos vacíos o
    // inválidos devolvemos null en lugar de romper el flujo.
    try {
        return await response.json()
    } catch {
        return null
    }
}

/**
 * Capa genérica de consumo del API.
 *
 * Todas las respuestas del backend tienen la forma
 * { success, message, data }, por lo que esta función
 * devuelve directamente `data` y lanza ApiError con el
 * `message` del servidor cuando algo falla.
 */
export async function request(path, options = {}) {
    const {
        method = "GET",
        body,
        authenticated = true,
        formData = false,
    } = options

    const headers = {}
    if (!formData) {
        // Con FormData el navegador genera él mismo el Content-Type
        // (incluye el boundary del multipart), por eso no se setea aquí.
        headers["Content-Type"] = "application/json"
    }
    const token = getStoredToken()
    // Solo adjuntamos Authorization si la petición la requiere y hay sesión
    if (authenticated && token) {
        headers["Authorization"] = `Bearer ${token}`
    }

    let response
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : formData ? body : JSON.stringify(body),
        })
    } catch {
        // fetch solo lanza ante fallo de red/CORS: lo traducimos a un mensaje amigable
        throw new ApiError(
            "No se pudo conectar con el servidor. Verifique que el API esté en ejecución."
        )
    }

    const payload = await parsePayload(response)

    // Hay dos formas de fallar: status HTTP de error o un 200 con success=false
    if (!response.ok || payload?.success === false) {
        throw new ApiError(
            payload?.message || `Ocurrió un error inesperado (${response.status}).`,
            response.status
        )
    }

    // Desenvolvemos la envoltura estándar { success, message, data } -> data
    return payload?.data !== undefined ? payload.data : payload
}
