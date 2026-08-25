import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import { AuthContext } from "./AuthContext"
import {
    loginUsuario,
    obtenerPerfil,
    registrarCliente,
} from "@/services/authService"
import { setStoredToken, getStoredToken } from "@/lib/http"

/**
 * Proveedor de sesión de la app. Orquesta todo el ciclo de vida de la autenticación:
 *
 * - Login/registro contra el API y perfil del usuario (GET /usuarios/perfil),
 *   que trae `rol: { nombre }` y `empleado: { id } | null` (clave para permisos y agenda).
 * - Persistencia del token en localStorage (clave "token") para restaurar
 *   la sesión al recargar la página.
 * - Expone helpers derivados: rol, empleadoId y hasRole() para los guardias de ruta.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    // Ref para saber si el componente sigue montado; evita hacer setState
    // después del desmonte cuando hay promesas en vuelo (típico warning/carrera async).
    const isMounted = useRef(true)

    const isAuthenticated = Boolean(token && user)

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    // Limpia token (localStorage) y estado en memoria. Se usa en logout
    // y cuando la sesión restaurada resulta inválida.
    const clearSession = useCallback(() => {
        setStoredToken(null)
        if (isMounted.current) {
            setToken(null)
            setUser(null)
        }
    }, [])

    /**
     * Inicia sesión: obtiene el token y el perfil del usuario.
     * El perfil incluye `rol` (objeto) y `empleado` (ficha o null),
     * necesarios para la matriz de permisos por rol.
     */
    const login = useCallback(async (correo, password) => {
        const { token: newToken } = await loginUsuario(correo, password)
        // IMPORTANTE: guardar el token en localStorage ANTES de pedir el perfil,
        // porque http.js arma el header Bearer leyendo de localStorage. Si se
        // guarda después, /usuarios/perfil saldría sin Authorization y el API
        // respondería 401 "Token no proporcionado".
        setStoredToken(newToken)
        try {
            const perfil = await obtenerPerfil()
            if (isMounted.current) {
                setToken(newToken)
                setUser(perfil)
            }
            return perfil
        } catch (e) {
            // Si el perfil falla con el token recién emitido, no dejamos
            // un token colgado en localStorage: limpiamos y propagamos.
            setStoredToken(null)
            throw e
        }
    }, [])

    // Registro público: solo crea la cuenta de Cliente; NO inicia sesión,
    // el usuario pasa luego por el login.
    const registerUser = useCallback(async (userData) => {
        return await registrarCliente(userData)
    }, [])

    const logout = useCallback(() => {
        clearSession()
    }, [clearSession])

    // Matriz de permisos en miniatura: ¿el rol actual está entre los permitidos?
    // La consumen los <RoleRoute> de cada ruta protegida.
    const hasRole = useCallback(
        (allowedRoles) => {
            const rolNombre = user?.rol?.nombre
            return Boolean(rolNombre && allowedRoles.includes(rolNombre))
        },
        [user]
    )

    // Al montar: si hay token guardado en localStorage, intentamos recuperar
    // la sesión pidiendo el perfil. Si el token ya no es válido, limpiamos.
    useEffect(() => {
        async function restoreSession() {
            const savedToken = getStoredToken()
            if (!savedToken) {
                if (isMounted.current) setLoading(false)
                return
            }
            try {
                // Set optimista del token para que http lo adjunte
                // en la llamada a obtenerPerfil() de abajo.
                setToken(savedToken)
                const perfil = await obtenerPerfil()
                if (isMounted.current) {
                    setUser(perfil)
                    setToken(savedToken)
                }
            } catch {
                // Token inválido/vencido → sesión muerta.
                clearSession()
            } finally {
                if (isMounted.current) setLoading(false)
            }
        }
        restoreSession()
    }, [clearSession])

    // Valor del contexto memoizado: mientras no cambie la sesión,
    // los consumidores no se re-renderizan sin motivo.
    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated,
            rol: user?.rol?.nombre ?? null,
            empleadoId: user?.empleado?.id ?? null,
            // Derivado para las pantallas de gestión (tratamientos,
            // especialistas, adicionales): solo true con rol Administrador.
            isAdmin: user?.rol?.nombre === "Administrador",
            login,
            logout,
            registerUser,
            hasRole,
        }),
        [user, token, loading, isAuthenticated, login, logout, registerUser, hasRole]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
