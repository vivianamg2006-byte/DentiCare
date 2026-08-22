import { useContext } from "react"
import { AuthContext } from "./AuthContext"

/**
 * Hook de acceso al contexto de autenticación.
 *
 * Es la puerta de entrada recomendada: en lugar de importar useContext + AuthContext
 * en cada componente, consumen esto directamente (user, rol, hasRole, login, etc.).
 *
 * Lanza error si se usa fuera del <AuthProvider>; así detectamos temprano
 * un árbol mal armado en vez de debuguear `undefined` misteriosos.
 */
export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de un AuthProvider."
        )
    }

    return context
}
