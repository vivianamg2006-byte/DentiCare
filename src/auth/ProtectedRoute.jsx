import PropTypes from "prop-types"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./useAuth"

/**
 * Guardián de rutas que exige sesión iniciada.
 *
 * OJO: la protección es SOLO de frontend (el API no protege endpoints),
 * así que esto evita ver pantallas sin sesión, no llamadas al backend.
 * Para control fino por rol se combina con <RoleRoute> como hijo.
 */
export function ProtectedRoute({ children }) {
    const { loading, isAuthenticated } = useAuth()
    const location = useLocation()

    // Mientras se restaura la sesión desde localStorage aún no sabemos
    // si hay usuario; decidir aquí provocaría un redirect falso a /login.
    if (loading) {
        return <p>Verificando sesión...</p>
    }

    if (!isAuthenticated) {
        // Guardamos `from` para que el login pueda devolver al usuario
        // a la página que intentaba visitar.
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
}
