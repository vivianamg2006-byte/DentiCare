import { createContext } from "react"

/**
 * Contexto global de autenticación de DentiCare.
 *
 * Arranca en `null`; el <AuthProvider> es quien lo llena con un objeto de la forma:
 *   { user, token, loading, isAuthenticated, rol, empleadoId, isAdmin,
 *     login, logout, registerUser, hasRole }
 *
 * El token JWT se persiste en localStorage bajo la clave "token",
 * así la sesión sobrevive recargas de la página.
 */
export const AuthContext = createContext(null)
